import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage";
import sharp from "sharp";
import { nanoid } from "nanoid";

// ============= VALIDATION SCHEMAS =============

const createProfileSchema = z.object({
  fullName: z.string().min(3),
  phone: z.string().optional(),
  location: z.object({
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
  }).optional(),
});

const createStoreSchema = z.object({
  name: z.string().min(3),
  slug: z.string().min(3),
  document: z.string().min(14).max(18),
  logoUrl: z.string().optional(),
});

const createCarSchema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  version: z.string().min(1),
  yearFab: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  yearModel: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  price: z.number().positive(),
  mileage: z.number().int().min(0),
  transmission: z.enum(["MANUAL", "AUTOMATIC", "CVT"]),
  fuel: z.enum(["FLEX", "GASOLINE", "DIESEL", "ELECTRIC", "HYBRID"]),
  color: z.string().min(1),
  description: z.string().max(2000).optional(),
  features: z.array(z.string()).optional(),
  storeId: z.number().int().optional(),
}).refine(data => data.yearModel >= data.yearFab, {
  message: "Ano do modelo não pode ser anterior ao ano de fabricação",
  path: ["yearModel"],
});

const carFiltersSchema = z.object({
  brand: z.string().optional(),
  model: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  minYear: z.number().optional(),
  maxYear: z.number().optional(),
  transmission: z.string().optional(),
  fuel: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  limit: z.number().default(20),
  offset: z.number().default(0),
});

const uploadPhotoSchema = z.object({
  carId: z.number().int(),
  imageData: z.string(), // base64
  orderIndex: z.number().int().min(0).max(14),
});

const createMessageSchema = z.object({
  carId: z.number().int(),
  receiverId: z.number().int(),
  content: z.string().min(1),
});

const createReviewSchema = z.object({
  sellerId: z.number().int(),
  carId: z.number().int().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

const createTransactionSchema = z.object({
  carId: z.number().int(),
  sellerId: z.number().int(),
  proposedPrice: z.number().positive().optional(),
  notes: z.string().optional(),
});

// ============= HELPER FUNCTIONS =============

async function processAndUploadImage(imageData: string, carId: number, orderIndex: number) {
  const buffer = Buffer.from(imageData.split(',')[1] || imageData, 'base64');
  
  // Generate thumbnail (400x300)
  const thumbBuffer = await sharp(buffer)
    .resize(400, 300, { fit: 'cover' })
    .webp({ quality: 80 })
    .toBuffer();
  
  // Generate medium (800x600)
  const mediumBuffer = await sharp(buffer)
    .resize(800, 600, { fit: 'cover' })
    .webp({ quality: 85 })
    .toBuffer();
  
  // Generate large (1600x1200)
  const largeBuffer = await sharp(buffer)
    .resize(1600, 1200, { fit: 'cover' })
    .webp({ quality: 90 })
    .toBuffer();
  
  const fileId = nanoid(10);
  
  const thumbResult = await storagePut(`cars/${carId}/thumb-${fileId}.webp`, thumbBuffer, 'image/webp');
  const mediumResult = await storagePut(`cars/${carId}/medium-${fileId}.webp`, mediumBuffer, 'image/webp');
  const largeResult = await storagePut(`cars/${carId}/large-${fileId}.webp`, largeBuffer, 'image/webp');
  
  return {
    thumb: thumbResult.url,
    medium: mediumResult.url,
    large: largeResult.url,
  };
}

// ============= MIDDLEWARE =============

const storeOwnerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'store_owner' && ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso restrito a donos de loja' });
  }
  return next({ ctx });
});

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso restrito a administradores' });
  }
  return next({ ctx });
});

// ============= ROUTERS =============

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return await db.getProfileById(ctx.user.id);
    }),
    
    create: protectedProcedure
      .input(createProfileSchema)
      .mutation(async ({ ctx, input }) => {
        await db.createProfile({
          id: ctx.user.id,
          fullName: input.fullName,
          phone: input.phone,
          location: input.location,
        });
        return { success: true };
      }),
    
    update: protectedProcedure
      .input(createProfileSchema.partial())
      .mutation(async ({ ctx, input }) => {
        await db.updateProfile(ctx.user.id, input);
        return { success: true };
      }),
  }),

  stores: router({
    create: storeOwnerProcedure
      .input(createStoreSchema)
      .mutation(async ({ ctx, input }) => {
        const store = await db.createStore({
          ownerId: ctx.user.id,
          name: input.name,
          slug: input.slug,
          document: input.document,
          logoUrl: input.logoUrl,
        });
        return store;
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number().int() }))
      .query(async ({ input }) => {
        const store = await db.getStoreById(input.id);
        if (!store) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Loja não encontrada' });
        }
        return store;
      }),
    
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const store = await db.getStoreBySlug(input.slug);
        if (!store) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Loja não encontrada' });
        }
        return store;
      }),
    
    getMy: storeOwnerProcedure.query(async ({ ctx }) => {
      return await db.getStoresByOwnerId(ctx.user.id);
    }),
    
    update: storeOwnerProcedure
      .input(z.object({
        id: z.number().int(),
        data: createStoreSchema.partial(),
      }))
      .mutation(async ({ ctx, input }) => {
        const store = await db.getStoreById(input.id);
        if (!store || store.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Sem permissão para editar esta loja' });
        }
        await db.updateStore(input.id, input.data);
        return { success: true };
      }),
    
    list: publicProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        return await db.getAllStores(input.limit, input.offset);
      }),
  }),

  cars: router({
    create: protectedProcedure
      .input(createCarSchema)
      .mutation(async ({ ctx, input }) => {
        // Check active car limit for regular users
        if (ctx.user.role === 'user') {
          const activeCars = await db.getActiveCarsBySellerId(ctx.user.id);
          if (activeCars.length >= 1) {
            throw new TRPCError({ 
              code: 'FORBIDDEN', 
              message: 'Limite de 1 anúncio ativo para o plano USER foi atingido.' 
            });
          }
        }
        
        const car = await db.createCar({
          sellerId: ctx.user.id,
          storeId: input.storeId,
          brand: input.brand,
          model: input.model,
          version: input.version,
          yearFab: input.yearFab,
          yearModel: input.yearModel,
          price: input.price.toString(),
          mileage: input.mileage,
          transmission: input.transmission,
          fuel: input.fuel,
          color: input.color,
          description: input.description,
          features: input.features,
          status: 'DRAFT',
        });
        
        return car;
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number().int() }))
      .query(async ({ input }) => {
        const car = await db.getCarById(input.id);
        if (!car) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Veículo não encontrado' });
        }
        return car;
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number().int(),
        data: createCarSchema.partial(),
      }))
      .mutation(async ({ ctx, input }) => {
        const car = await db.getCarById(input.id);
        if (!car || car.sellerId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Sem permissão para editar este anúncio' });
        }
        
        if (input.data.yearModel && input.data.yearFab && input.data.yearModel < input.data.yearFab) {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: 'Ano do modelo não pode ser anterior ao ano de fabricação' 
          });
        }
        
        await db.updateCar(input.id, input.data as any);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ ctx, input }) => {
        const car = await db.getCarById(input.id);
        if (!car || car.sellerId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Sem permissão para deletar este anúncio' });
        }
        await db.deleteCar(input.id);
        return { success: true };
      }),
    
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number().int(),
        status: z.enum(['DRAFT', 'ACTIVE', 'SOLD', 'BANNED']),
      }))
      .mutation(async ({ ctx, input }) => {
        const car = await db.getCarById(input.id);
        if (!car || car.sellerId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Sem permissão para alterar este anúncio' });
        }
        
        // Check limit when activating
        if (input.status === 'ACTIVE' && car.status !== 'ACTIVE' && ctx.user.role === 'user') {
          const activeCars = await db.getActiveCarsBySellerId(ctx.user.id);
          if (activeCars.length >= 1) {
            throw new TRPCError({ 
              code: 'FORBIDDEN', 
              message: 'Limite de 1 anúncio ativo para o plano USER foi atingido.' 
            });
          }
        }
        
        await db.updateCar(input.id, { status: input.status });
        return { success: true };
      }),
    
    getMyCars: protectedProcedure.query(async ({ ctx }) => {
      return await db.getCarsBySellerId(ctx.user.id);
    }),
    
    search: publicProcedure
      .input(carFiltersSchema)
      .query(async ({ input }) => {
        const { limit, offset, ...filters } = input;
        const result = await db.searchCars(filters, limit, offset);
        
        return {
          data: result.data,
          pagination: {
            total: result.total,
            limit,
            offset,
            hasNext: offset + limit < result.total,
          },
        };
      }),
  }),

  photos: router({
    upload: protectedProcedure
      .input(uploadPhotoSchema)
      .mutation(async ({ ctx, input }) => {
        const car = await db.getCarById(input.carId);
        if (!car || car.sellerId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Sem permissão para adicionar fotos a este anúncio' });
        }
        
        const existingPhotos = await db.getCarPhotos(input.carId);
        if (existingPhotos.length >= 15) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Máximo de 15 fotos por anúncio' });
        }
        
        const urls = await processAndUploadImage(input.imageData, input.carId, input.orderIndex);
        
        const photo = await db.createCarPhoto({
          carId: input.carId,
          urls,
          orderIndex: input.orderIndex,
        });
        
        return photo;
      }),
    
    list: publicProcedure
      .input(z.object({ carId: z.number().int() }))
      .query(async ({ input }) => {
        return await db.getCarPhotos(input.carId);
      }),
    
    delete: protectedProcedure
      .input(z.object({ photoId: z.number().int() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteCarPhoto(input.photoId);
        return { success: true };
      }),
    
    reorder: protectedProcedure
      .input(z.object({
        updates: z.array(z.object({
          photoId: z.number().int(),
          orderIndex: z.number().int(),
        })),
      }))
      .mutation(async ({ input }) => {
        for (const update of input.updates) {
          await db.updatePhotoOrder(update.photoId, update.orderIndex);
        }
        return { success: true };
      }),
  }),

  messages: router({
    send: protectedProcedure
      .input(createMessageSchema)
      .mutation(async ({ ctx, input }) => {
        const message = await db.createMessage({
          carId: input.carId,
          senderId: ctx.user.id,
          receiverId: input.receiverId,
          content: input.content,
          isRead: false,
        });
        return message;
      }),
    
    getConversation: protectedProcedure
      .input(z.object({
        carId: z.number().int(),
        otherUserId: z.number().int(),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getConversation(input.carId, ctx.user.id, input.otherUserId);
      }),
    
    getMyConversations: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserConversations(ctx.user.id);
    }),
    
    markAsRead: protectedProcedure
      .input(z.object({ messageIds: z.array(z.number().int()) }))
      .mutation(async ({ input }) => {
        await db.markMessagesAsRead(input.messageIds);
        return { success: true };
      }),
  }),

  reviews: router({
    create: protectedProcedure
      .input(createReviewSchema)
      .mutation(async ({ ctx, input }) => {
        const review = await db.createReview({
          sellerId: input.sellerId,
          reviewerId: ctx.user.id,
          carId: input.carId,
          rating: input.rating,
          comment: input.comment,
        });
        return review;
      }),
    
    getBySeller: publicProcedure
      .input(z.object({ sellerId: z.number().int() }))
      .query(async ({ input }) => {
        const reviews = await db.getSellerReviews(input.sellerId);
        const stats = await db.getSellerAverageRating(input.sellerId);
        return { reviews, stats };
      }),
  }),

  transactions: router({
    create: protectedProcedure
      .input(createTransactionSchema)
      .mutation(async ({ ctx, input }) => {
        const transaction = await db.createTransaction({
          carId: input.carId,
          buyerId: ctx.user.id,
          sellerId: input.sellerId,
          proposedPrice: input.proposedPrice?.toString(),
          status: 'PENDING',
          notes: input.notes,
        });
        return transaction;
      }),
    
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number().int(),
        status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED']),
      }))
      .mutation(async ({ ctx, input }) => {
        const transaction = await db.getTransactionById(input.id);
        if (!transaction) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Transação não encontrada' });
        }
        
        if (transaction.sellerId !== ctx.user.id && transaction.buyerId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Sem permissão para alterar esta transação' });
        }
        
        await db.updateTransaction(input.id, { status: input.status });
        return { success: true };
      }),
    
    getMy: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserTransactions(ctx.user.id);
    }),
  }),

  admin: router({
    dashboard: adminProcedure.query(async () => {
      return await db.getAdminDashboardStats();
    }),
    
    moderateCar: adminProcedure
      .input(z.object({
        carId: z.number().int(),
        status: z.enum(['ACTIVE', 'BANNED']),
      }))
      .mutation(async ({ input }) => {
        await db.updateCar(input.carId, { status: input.status });
        return { success: true };
      }),
    
    getAllCars: adminProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        return await db.getAllCarsForModeration(input.limit, input.offset);
      }),
  }),
});

export type AppRouter = typeof appRouter;

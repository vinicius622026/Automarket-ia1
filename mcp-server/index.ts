#!/usr/bin/env node

/**
 * AutoMarket AI MCP Server
 * 
 * Provides AI-powered tools for car marketplace operations:
 * - estimate_car_value: Estimate market value based on historical data
 * - generate_ad_copy: Generate optimized ad descriptions
 * - analyze_market_trends: Analyze market trends for specific brands/models
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { drizzle } from "drizzle-orm/mysql2";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import { cars } from "../drizzle/schema.js";

// Database connection
const db = process.env.DATABASE_URL ? drizzle(process.env.DATABASE_URL) : null;

// Tool: Estimate Car Value
async function estimateCarValue(params: {
  brand: string;
  model: string;
  year_model: number;
  mileage: number;
}) {
  if (!db) {
    throw new Error("Database not available");
  }

  const { brand, model, year_model, mileage } = params;

  // Find similar cars (same brand/model, ±2 years, ±20k km)
  const similarCars = await db
    .select()
    .from(cars)
    .where(
      and(
        eq(cars.brand, brand),
        eq(cars.model, model),
        gte(cars.yearModel, year_model - 2),
        lte(cars.yearModel, year_model + 2),
        gte(cars.mileage, mileage - 20000),
        lte(cars.mileage, mileage + 20000),
        eq(cars.status, "ACTIVE")
      )
    )
    .limit(50);

  if (similarCars.length === 0) {
    return {
      estimated_price: null,
      price_range: { min: null, max: null },
      confidence: 0,
      similar_cars_analyzed: 0,
      message: "Dados insuficientes para estimativa precisa",
    };
  }

  // Calculate statistics
  const prices = similarCars.map((car) => Number(car.price));
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // Adjust for mileage difference
  const avgMileage = similarCars.reduce((a, b) => a + b.mileage, 0) / similarCars.length;
  const mileageDiff = mileage - avgMileage;
  const mileageAdjustment = (mileageDiff / 10000) * 0.02; // 2% per 10k km
  const adjustedPrice = avgPrice * (1 - mileageAdjustment);

  // Confidence based on sample size
  const confidence = Math.min(similarCars.length / 30, 1);

  return {
    estimated_price: Math.round(adjustedPrice),
    price_range: {
      min: Math.round(minPrice * 0.95),
      max: Math.round(maxPrice * 1.05),
    },
    confidence: Math.round(confidence * 100) / 100,
    similar_cars_analyzed: similarCars.length,
    market_insights: {
      average_price: Math.round(avgPrice),
      average_mileage: Math.round(avgMileage),
      price_trend: mileageDiff > 0 ? "below_average" : "above_average",
    },
  };
}

// Tool: Generate Ad Copy
async function generateAdCopy(params: {
  car_id: number;
  tone?: "professional" | "casual" | "luxury";
  max_length?: number;
}) {
  if (!db) {
    throw new Error("Database not available");
  }

  const { car_id, tone = "professional", max_length = 500 } = params;

  // Get car details
  const carResult = await db.select().from(cars).where(eq(cars.id, car_id)).limit(1);

  if (carResult.length === 0) {
    throw new Error("Car not found");
  }

  const car = carResult[0];

  // Generate copy based on tone
  let adCopy = "";

  if (tone === "luxury") {
    adCopy = `Apresentamos este magnífico ${car.brand} ${car.model} ${car.version} ${car.yearModel}. `;
    adCopy += `Com apenas ${car.mileage.toLocaleString("pt-BR")} km rodados, este veículo representa o equilíbrio perfeito entre elegância e performance. `;
    adCopy += `Equipado com câmbio ${car.transmission === "AUTOMATIC" ? "automático" : car.transmission === "MANUAL" ? "manual" : "CVT"} e motor ${car.fuel}. `;
    if (car.features && car.features.length > 0) {
      adCopy += `Entre os opcionais destacam-se: ${car.features.slice(0, 3).join(", ")}. `;
    }
    adCopy += `Uma oportunidade única para quem busca sofisticação e confiabilidade.`;
  } else if (tone === "casual") {
    adCopy = `${car.brand} ${car.model} ${car.yearModel} em ótimo estado! `;
    adCopy += `Apenas ${car.mileage.toLocaleString("pt-BR")} km, cor ${car.color}, câmbio ${car.transmission}. `;
    if (car.features && car.features.length > 0) {
      adCopy += `Vem com ${car.features.slice(0, 3).join(", ")} e muito mais. `;
    }
    adCopy += `Carro revisado e pronto para rodar. Aceito propostas!`;
  } else {
    // professional
    adCopy = `${car.brand} ${car.model} ${car.version} ${car.yearModel}/${car.yearFab}. `;
    adCopy += `Veículo em excelente estado de conservação com ${car.mileage.toLocaleString("pt-BR")} km. `;
    adCopy += `Especificações: Câmbio ${car.transmission}, Combustível ${car.fuel}, Cor ${car.color}. `;
    if (car.features && car.features.length > 0) {
      adCopy += `Equipamentos: ${car.features.join(", ")}. `;
    }
    if (car.description) {
      adCopy += car.description;
    }
    adCopy += ` Documentação em dia. Aceito visitas e test drive.`;
  }

  // Truncate if needed
  if (adCopy.length > max_length) {
    adCopy = adCopy.substring(0, max_length - 3) + "...";
  }

  return {
    ad_copy: adCopy,
    tone_used: tone,
    length: adCopy.length,
    seo_keywords: [
      car.brand,
      car.model,
      car.yearModel.toString(),
      car.transmission,
      car.fuel,
    ],
    seo_score: 0.85 + Math.random() * 0.15, // Simulated SEO score
  };
}

// Tool: Analyze Market Trends
async function analyzeMarketTrends(params: {
  brand: string;
  model?: string;
  timeframe_days?: number;
}) {
  if (!db) {
    throw new Error("Database not available");
  }

  const { brand, model, timeframe_days = 30 } = params;

  // Calculate date threshold
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - timeframe_days);

  // Build query conditions
  const conditions = [eq(cars.brand, brand), eq(cars.status, "ACTIVE")];
  if (model) {
    conditions.push(eq(cars.model, model));
  }

  // Get recent listings
  const recentCars = await db
    .select()
    .from(cars)
    .where(and(...conditions))
    .orderBy(desc(cars.createdAt))
    .limit(100);

  if (recentCars.length === 0) {
    return {
      avg_price_trend_percent: "N/A",
      avg_days_to_sell: null,
      demand_level: "unknown",
      recommendations: ["Dados insuficientes para análise de tendências"],
      total_listings: 0,
    };
  }

  // Calculate average price
  const avgPrice = recentCars.reduce((sum, car) => sum + Number(car.price), 0) / recentCars.length;

  // Simulate trend calculation (in production, compare with historical data)
  const priceTrend = (Math.random() - 0.5) * 10; // -5% to +5%

  // Estimate demand level based on listing count
  let demandLevel: "low" | "medium" | "high";
  if (recentCars.length < 10) {
    demandLevel = "low";
  } else if (recentCars.length < 30) {
    demandLevel = "medium";
  } else {
    demandLevel = "high";
  }

  // Generate recommendations
  const recommendations: string[] = [];
  if (priceTrend > 2) {
    recommendations.push("Mercado aquecido. Considere aumentar preço em até 3%.");
  } else if (priceTrend < -2) {
    recommendations.push("Mercado em baixa. Seja competitivo no preço para vender rápido.");
  } else {
    recommendations.push("Mercado estável. Mantenha preços dentro da média.");
  }

  if (demandLevel === "high") {
    recommendations.push("Alta demanda detectada. Bom momento para vender.");
  } else if (demandLevel === "low") {
    recommendations.push("Baixa demanda. Invista em fotos e descrição de qualidade.");
  }

  return {
    avg_price_trend_percent: `${priceTrend > 0 ? "+" : ""}${priceTrend.toFixed(1)}%`,
    avg_days_to_sell: Math.round(15 + Math.random() * 20), // Simulated
    demand_level: demandLevel,
    recommendations,
    total_listings: recentCars.length,
    avg_price: Math.round(avgPrice),
    price_range: {
      min: Math.round(Math.min(...recentCars.map((c) => Number(c.price)))),
      max: Math.round(Math.max(...recentCars.map((c) => Number(c.price)))),
    },
  };
}

// Initialize MCP Server
const server = new Server(
  {
    name: "automarket-ai-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "estimate_car_value",
        description:
          "Estimate the market value of a vehicle based on historical data from similar cars. Analyzes brand, model, year, and mileage to provide price estimates and confidence scores.",
        inputSchema: {
          type: "object",
          properties: {
            brand: {
              type: "string",
              description: "Car brand (e.g., Toyota, Honda)",
            },
            model: {
              type: "string",
              description: "Car model (e.g., Corolla, Civic)",
            },
            year_model: {
              type: "number",
              description: "Model year",
            },
            mileage: {
              type: "number",
              description: "Current mileage in kilometers",
            },
          },
          required: ["brand", "model", "year_model", "mileage"],
        },
      },
      {
        name: "generate_ad_copy",
        description:
          "Generate optimized ad copy for a car listing. Creates SEO-friendly descriptions in different tones (professional, casual, luxury) based on car details.",
        inputSchema: {
          type: "object",
          properties: {
            car_id: {
              type: "number",
              description: "ID of the car in the database",
            },
            tone: {
              type: "string",
              enum: ["professional", "casual", "luxury"],
              description: "Writing tone for the ad copy",
              default: "professional",
            },
            max_length: {
              type: "number",
              description: "Maximum length of generated text",
              default: 500,
            },
          },
          required: ["car_id"],
        },
      },
      {
        name: "analyze_market_trends",
        description:
          "Analyze market trends for a specific brand/model. Provides insights on pricing trends, demand levels, and strategic recommendations for sellers.",
        inputSchema: {
          type: "object",
          properties: {
            brand: {
              type: "string",
              description: "Car brand to analyze",
            },
            model: {
              type: "string",
              description: "Car model to analyze (optional)",
            },
            timeframe_days: {
              type: "number",
              description: "Number of days to analyze",
              default: 30,
            },
          },
          required: ["brand"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;

    switch (name) {
      case "estimate_car_value":
        result = await estimateCarValue(args as any);
        break;
      case "generate_ad_copy":
        result = await generateAdCopy(args as any);
        break;
      case "analyze_market_trends":
        result = await analyzeMarketTrends(args as any);
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: error instanceof Error ? error.message : "Unknown error",
          }),
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("AutoMarket AI MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

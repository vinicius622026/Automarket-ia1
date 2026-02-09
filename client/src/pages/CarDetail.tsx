import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/_core/hooks/useAuth";
import { 
  ChevronLeft, Car, Calendar, Gauge, Fuel, Settings, 
  Palette, MessageSquare, Heart, Share2, MapPin 
} from "lucide-react";
import { toast } from "sonner";

export default function CarDetail() {
  const [, params] = useRoute("/cars/:id");
  const carId = params?.id ? parseInt(params.id) : 0;
  const { isAuthenticated } = useAuth();

  const { data: car, isLoading } = trpc.cars.getById.useQuery({ id: carId });
  const { data: photos } = trpc.photos.list.useQuery({ carId });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="container flex h-16 items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-6 w-48" />
          </div>
        </div>
        <div className="container py-8">
          <div className="grid lg:grid-cols-[1fr_400px] gap-8">
            <div className="space-y-6">
              <Skeleton className="aspect-video w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Veículo não encontrado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Este anúncio pode ter sido removido ou não existe mais.
            </p>
            <Button asChild>
              <Link href="/cars">
                <a>Voltar para Listagem</a>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleContact = () => {
    if (!isAuthenticated) {
      toast.error("Faça login para entrar em contato");
      return;
    }
    toast.success("Funcionalidade de mensagens em desenvolvimento");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cars">
              <a>
                <ChevronLeft className="h-5 w-5" />
              </a>
            </Link>
          </Button>
          <h1 className="text-xl font-bold truncate">
            {car.brand} {car.model}
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="aspect-video bg-muted flex items-center justify-center">
                {photos && photos.length > 0 ? (
                  <img 
                    src={photos[0].urls.large} 
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Car className="h-24 w-24 text-muted-foreground" />
                )}
              </div>
              {photos && photos.length > 1 && (
                <div className="p-4 grid grid-cols-4 gap-2">
                  {photos.slice(1, 5).map((photo) => (
                    <div key={photo.id} className="aspect-video bg-muted rounded-lg overflow-hidden">
                      <img 
                        src={photo.urls.thumb} 
                        alt="Foto do veículo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl">
                      {car.brand} {car.model}
                    </CardTitle>
                    <p className="text-lg text-muted-foreground mt-1">
                      {car.version}
                    </p>
                  </div>
                  <Badge variant={car.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {car.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Ano</div>
                      <div className="font-semibold">{car.yearModel}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Gauge className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">KM</div>
                      <div className="font-semibold">{car.mileage.toLocaleString('pt-BR')}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Settings className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Câmbio</div>
                      <div className="font-semibold">{car.transmission}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Fuel className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Combustível</div>
                      <div className="font-semibold">{car.fuel}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Palette className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Cor</div>
                      <div className="font-semibold">{car.color}</div>
                    </div>
                  </div>
                </div>

                {car.description && (
                  <div>
                    <h3 className="font-semibold mb-2">Descrição</h3>
                    <p className="text-muted-foreground">{car.description}</p>
                  </div>
                )}

                {car.features && car.features.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Opcionais</h3>
                    <div className="flex flex-wrap gap-2">
                      {car.features.map((feature, index) => (
                        <Badge key={index} variant="secondary">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground mb-2">Preço</div>
                <div className="text-4xl font-bold text-primary mb-6">
                  R$ {Number(car.price).toLocaleString('pt-BR')}
                </div>
                <Button className="w-full" size="lg" onClick={handleContact}>
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Entrar em Contato
                </Button>
              </CardContent>
            </Card>

            {/* Seller Card */}
            <Card>
              <CardHeader>
                <CardTitle>Vendedor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Car className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Vendedor #{car.sellerId}</div>
                    <div className="text-sm text-muted-foreground">Membro desde 2024</div>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Ver Perfil
                </Button>
              </CardContent>
            </Card>

            {/* Location Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Localização
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Informações de localização disponíveis após contato
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

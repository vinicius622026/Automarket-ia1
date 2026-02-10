import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Store, MapPin, Phone, Mail, CheckCircle, ArrowLeft, Car } from "lucide-react";
import { Link, useLocation, useParams } from "wouter";

export default function StoreProfile() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const storeId = params.id ? parseInt(params.id) : 0;

  const { data: store, isLoading } = trpc.stores.getById.useQuery({ id: storeId });
  const { data: carsData } = trpc.cars.search.useQuery({
    storeId,
    limit: 12,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Loja não encontrada</h2>
          <Button onClick={() => setLocation("/")}>Voltar para Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Perfil da Loja</h1>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Store Info Card */}
        <Card className="p-8 mb-8">
          <div className="flex items-start gap-6">
            {store.logoUrl && (
              <img
                src={store.logoUrl}
                alt={store.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold">{store.name}</h2>
                {store.isVerified && (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Verificada
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mb-4">CNPJ: {store.document}</p>

              <div className="flex flex-wrap gap-6 text-sm">
                {store.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{store.phone}</span>
                  </div>
                )}
                {store.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{store.email}</span>
                  </div>
                )}
                {store.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {store.location.city}, {store.location.state}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Separator className="my-8" />

        {/* Store Vehicles */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Car className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Veículos da Loja</h2>
            <Badge variant="secondary">{carsData?.pagination?.total || 0}</Badge>
          </div>

          {carsData && carsData.data.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {carsData.data.map((car) => (
                <Link key={car.id} href={`/cars/${car.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <Car className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-1">
                        {car.brand} {car.model}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">{car.version}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-2xl font-bold text-primary">
                          R$ {Number(car.price).toLocaleString("pt-BR")}
                        </p>
                        <Badge variant="secondary">
                          {car.yearModel}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Nenhum veículo disponível</p>
              <p className="text-muted-foreground">
                Esta loja ainda não possui veículos cadastrados
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

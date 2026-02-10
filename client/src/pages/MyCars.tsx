import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Car, Plus, Edit, Trash2, Eye, Loader2 } from "lucide-react";
import { useState } from "react";

export default function MyCars() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Redirect if not authenticated
  if (!loading && !isAuthenticated) {
    setLocation("/login");
    return null;
  }

  const { data: myCarsResponse, refetch } = trpc.cars.search.useQuery({
    status: "ACTIVE",
  });

  const myCars = myCarsResponse?.data || [];

  const deleteCarMutation = trpc.cars.delete.useMutation({
    onSuccess: () => {
      toast.success("Anúncio excluído com sucesso!");
      refetch();
      setDeletingId(null);
    },
    onError: (error) => {
      toast.error(error.message);
      setDeletingId(null);
    },
  });

  const handleDelete = (id: number) => {
    setDeletingId(id);
    deleteCarMutation.mutate({ id });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="border-b bg-background sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2 font-bold text-xl">
              <Car className="h-6 w-6 text-primary" />
              <span>AutoMarket AI</span>
            </a>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <a className="text-sm font-medium hover:text-primary transition-colors">
                Dashboard
              </a>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Meus Anúncios</h1>
            <p className="text-muted-foreground">
              Gerencie seus veículos anunciados
            </p>
          </div>
          <Link href="/cars/new">
            <Button size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Novo Anúncio
            </Button>
          </Link>
        </div>

        {/* Cars Grid */}
        {myCars.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <Car className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Nenhum anúncio ainda</h3>
              <p className="text-muted-foreground mb-6">
                Comece criando seu primeiro anúncio de veículo
              </p>
              <Link href="/cars/new">
                <Button size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Criar Primeiro Anúncio
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCars.map((car: any) => (
              <Card key={car.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-slate-200 relative">
                  {car.photos && car.photos.length > 0 ? (
                    <img
                      src={car.photos[0].urls.medium}
                      alt={`${car.brand} ${car.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car className="h-16 w-16 text-muted-foreground opacity-30" />
                    </div>
                  )}
                  <Badge
                    className="absolute top-2 right-2"
                    variant={car.status === "ACTIVE" ? "default" : "secondary"}
                  >
                    {car.status}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-1">
                    {car.brand} {car.model}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {car.version}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        R$ {parseFloat(car.price).toLocaleString("pt-BR")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {car.yearModel} • {car.mileage.toLocaleString()} km
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/cars/${car.id}`}>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    </Link>
                    <Link href={`/cars/${car.id}/edit`}>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          disabled={deletingId === car.id}
                        >
                          {deletingId === car.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir este anúncio? Esta ação não
                            pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(car.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

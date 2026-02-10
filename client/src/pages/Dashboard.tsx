import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Car, MessageSquare, Heart, User, Plus, TrendingUp, Eye, LogOut } from "lucide-react";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      localStorage.removeItem("supabase_token");
      setLocation("/");
    },
  });

  // Redirect if not authenticated
  if (!loading && !isAuthenticated) {
    setLocation("/login");
    return null;
  }

  const { data: myCarsResponse } = trpc.cars.search.useQuery({
    status: "ACTIVE",
  });

  const myCars = myCarsResponse?.data || [];

  const stats = [
    {
      title: "Meus Anúncios",
      value: myCars.length || 0,
      icon: Car,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/dashboard/my-cars",
    },
    {
      title: "Mensagens",
      value: 0,
      icon: MessageSquare,
      color: "text-green-600",
      bgColor: "bg-green-50",
      href: "/dashboard/messages",
    },
    {
      title: "Favoritos",
      value: 0,
      icon: Heart,
      color: "text-red-600",
      bgColor: "bg-red-50",
      href: "/dashboard/favorites",
    },
    {
      title: "Visualizações",
      value: 0,
      icon: Eye,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

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
            <Link href="/cars">
              <a className="text-sm font-medium hover:text-primary transition-colors">
                Explorar
              </a>
            </Link>
            <Link href="/dashboard">
              <a className="text-sm font-medium text-primary">
                Dashboard
              </a>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </nav>

      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Bem-vindo, {user?.name || "Usuário"}!</h1>
          <p className="text-muted-foreground">Gerencie seus anúncios e acompanhe suas atividades</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const content = (
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-full`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );

            return stat.href ? (
              <Link key={stat.title} href={stat.href}>
                <a>{content}</a>
              </Link>
            ) : (
              <div key={stat.title}>{content}</div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>Gerencie seus anúncios e perfil</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/cars/new">
                <Button className="w-full justify-start" size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Criar Novo Anúncio
                </Button>
              </Link>
              <Link href="/dashboard/my-cars">
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <Car className="h-5 w-5 mr-2" />
                  Ver Meus Anúncios
                </Button>
              </Link>
              <Link href="/dashboard/profile">
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <User className="h-5 w-5 mr-2" />
                  Editar Perfil
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>Suas últimas ações na plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myCars.length > 0 ? (
                  myCars.slice(0, 3).map((car: any) => (
                    <div key={car.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium">{car.brand} {car.model}</p>
                        <p className="text-sm text-muted-foreground">{car.version}</p>
                      </div>
                      <Badge variant={car.status === "ACTIVE" ? "default" : "secondary"}>
                        {car.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Car className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum anúncio ainda</p>
                    <p className="text-sm">Crie seu primeiro anúncio para começar</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tips Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Dicas para Vender Mais Rápido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Adicione fotos de alta qualidade de todos os ângulos do veículo</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Descreva detalhadamente o estado e histórico do veículo</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Responda rapidamente às mensagens dos interessados</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Mantenha o preço competitivo com o mercado</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

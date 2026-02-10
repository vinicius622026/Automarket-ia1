import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link, useLocation } from "wouter";
import { 
  BarChart3, Users, Car, Store, Shield, AlertTriangle,
  CheckCircle, XCircle, ChevronLeft 
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedCar, setSelectedCar] = useState<number | null>(null);
  const [moderationReason, setModerationReason] = useState("");
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [banReason, setBanReason] = useState("");

  // Check if user is admin
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Acesso Negado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Você não tem permissão para acessar o painel administrativo.
            </p>
            <Button onClick={() => setLocation("/")}>Voltar para Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: stats } = trpc.admin.dashboard.useQuery();
  const { data: carsData, refetch: refetchCars } = trpc.admin.getAllCars.useQuery({
    limit: 50,
    offset: 0,
  });
  const { data: usersData, refetch: refetchUsers } = trpc.admin.getAllUsers.useQuery({
    limit: 50,
    offset: 0,
  });
  const { data: storesData, refetch: refetchStores } = trpc.admin.getAllStores.useQuery({
    limit: 50,
    offset: 0,
  });

  // Analytics data
  const { data: newUsersData } = trpc.admin.getNewUsersPerDay.useQuery({ days: 30 });
  const { data: newCarsData } = trpc.admin.getCarsCreatedPerDay.useQuery({ days: 30 });
  const { data: carsByBrand } = trpc.admin.getCarsByBrand.useQuery({ limit: 10 });
  const { data: carsByFuel } = trpc.admin.getCarsByFuel.useQuery();

  const COLORS = ['#1e40af', '#f97316', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  const moderateCarMutation = trpc.admin.moderateCar.useMutation({
    onSuccess: () => {
      toast.success("Anúncio moderado com sucesso");
      refetchCars();
      setSelectedCar(null);
      setModerationReason("");
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const updateUserRoleMutation = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      toast.success("Role do usuário atualizado");
      refetchUsers();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const banUserMutation = trpc.admin.banUser.useMutation({
    onSuccess: () => {
      toast.success("Usuário banido com sucesso");
      refetchUsers();
      setSelectedUser(null);
      setBanReason("");
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const verifyStoreMutation = trpc.admin.verifyStore.useMutation({
    onSuccess: () => {
      toast.success("Loja verificada");
      refetchStores();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleModerateCar = (carId: number, status: "ACTIVE" | "BANNED" | "DRAFT") => {
    moderateCarMutation.mutate({
      carId,
      status,
      reason: moderationReason || undefined,
    });
  };

  const handleBanUser = () => {
    if (!selectedUser || !banReason) {
      toast.error("Informe o motivo do banimento");
      return;
    }
    banUserMutation.mutate({
      userId: selectedUser,
      reason: banReason,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <a>
                <ChevronLeft className="h-5 w-5" />
              </a>
            </Link>
          </Button>
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Painel Administrativo</h1>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Veículos</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCars || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Lojas Ativas</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalStores || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Anúncios Ativos</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeCars || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="cars" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="cars">Anúncios</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="stores">Lojas</TabsTrigger>
          </TabsList>

          {/* Overview Tab with Charts */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* New Users Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Novos Usuários (Últimos 30 dias)</CardTitle>
                </CardHeader>
                <CardContent>
                  {newUsersData && newUsersData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={newUsersData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="count" stroke="#1e40af" name="Usuários" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-muted-foreground">Nenhum dado disponível</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* New Cars Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Novos Anúncios (Últimos 30 dias)</CardTitle>
                </CardHeader>
                <CardContent>
                  {newCarsData && newCarsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={newCarsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#f97316" name="Anúncios" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-muted-foreground">Nenhum dado disponível</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Cars by Brand Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Veículos por Marca (Top 10)</CardTitle>
                </CardHeader>
                <CardContent>
                  {carsByBrand && carsByBrand.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={carsByBrand} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="brand" type="category" width={80} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#10b981" name="Quantidade" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-muted-foreground">Nenhum dado disponível</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Cars by Fuel Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Combustível</CardTitle>
                </CardHeader>
                <CardContent>
                  {carsByFuel && carsByFuel.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={carsByFuel}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ fuel, count }) => `${fuel}: ${count}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {carsByFuel.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-muted-foreground">Nenhum dado disponível</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Cars Tab */}
          <TabsContent value="cars" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Moderação de Anúncios</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Veículo</TableHead>
                      <TableHead>Vendedor</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {carsData && Array.isArray(carsData) && carsData.length > 0 ? (
                      carsData.map((car: any) => (
                        <TableRow key={car.id}>
                          <TableCell>{car.id}</TableCell>
                          <TableCell>
                            {car.brand} {car.model} {car.yearModel}
                          </TableCell>
                          <TableCell>#{car.sellerId}</TableCell>
                          <TableCell>R$ {Number(car.price).toLocaleString("pt-BR")}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                car.status === "ACTIVE"
                                  ? "default"
                                  : car.status === "BANNED"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {car.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {car.status !== "ACTIVE" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleModerateCar(car.id, "ACTIVE")}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              {car.status !== "BANNED" && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => setSelectedCar(car.id)}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          Nenhum anúncio encontrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersData?.data && usersData.data.length > 0 ? (
                      usersData.data.map((user: any) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.id}</TableCell>
                          <TableCell>{user.name || "N/A"}</TableCell>
                          <TableCell>{user.email || "N/A"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Select
                                value={user.role}
                                onValueChange={(role: "user" | "store_owner" | "admin") =>
                                  updateUserRoleMutation.mutate({ userId: user.id, role })
                                }
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">User</SelectItem>
                                  <SelectItem value="store_owner">Store Owner</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setSelectedUser(user.id)}
                              >
                                <AlertTriangle className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          Nenhum usuário encontrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stores Tab */}
          <TabsContent value="stores" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Lojas</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Verificada</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {storesData?.data && storesData.data.length > 0 ? (
                      storesData.data.map((store: any) => (
                        <TableRow key={store.id}>
                          <TableCell>{store.id}</TableCell>
                          <TableCell>{store.name}</TableCell>
                          <TableCell>{store.slug}</TableCell>
                          <TableCell>
                            {store.isVerified ? (
                              <Badge variant="default">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verificada
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Não Verificada</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant={store.isVerified ? "outline" : "default"}
                              onClick={() =>
                                verifyStoreMutation.mutate({
                                  storeId: store.id,
                                  isVerified: !store.isVerified,
                                })
                              }
                            >
                              {store.isVerified ? "Remover Verificação" : "Verificar"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          Nenhuma loja encontrada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Ban Car Dialog */}
      <Dialog open={selectedCar !== null} onOpenChange={() => setSelectedCar(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Banir Anúncio</DialogTitle>
            <DialogDescription>
              Informe o motivo do banimento deste anúncio.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Motivo do banimento..."
            value={moderationReason}
            onChange={(e) => setModerationReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedCar(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedCar && handleModerateCar(selectedCar, "BANNED")}
            >
              Banir Anúncio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban User Dialog */}
      <Dialog open={selectedUser !== null} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Banir Usuário</DialogTitle>
            <DialogDescription>
              Todos os anúncios deste usuário serão banidos. Informe o motivo.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Motivo do banimento..."
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleBanUser}>
              Banir Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

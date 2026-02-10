import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ArrowLeft, TrendingUp, Car, MessageSquare, Star, Eye } from "lucide-react";
import { toast } from "sonner";

export default function StoreAnalytics() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const storeId = parseInt(params.id || "0");

  const { data: analytics, isLoading: loadingAnalytics } = trpc.stores.getAnalytics.useQuery({ storeId });
  const { data: vehiclesTrend, isLoading: loadingVehicles } = trpc.stores.getVehiclesTrend.useQuery({ storeId, days: 30 });
  const { data: messagesTrend, isLoading: loadingMessages } = trpc.stores.getMessagesTrend.useQuery({ storeId, days: 30 });
  const { data: mostViewed, isLoading: loadingMostViewed } = trpc.stores.getMostViewed.useQuery({ storeId, limit: 5 });

  if (loadingAnalytics) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-muted-foreground">Erro ao carregar analytics</p>
          <Button onClick={() => setLocation("/dashboard")}>Voltar ao Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Analytics da Loja</h1>
            <p className="text-muted-foreground">Visualize o desempenho da sua loja</p>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Veículos</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalVehicles}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.activeVehicles} ativos, {analytics.soldVehicles} vendidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Recebidas</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalMessages}</div>
            <p className="text-xs text-muted-foreground">
              Total de leads gerados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalReviews} avaliações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.totalVehicles > 0 
                ? ((analytics.soldVehicles / analytics.totalVehicles) * 100).toFixed(1)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Veículos vendidos / total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Vehicles Created Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Veículos Cadastrados (Últimos 30 dias)</CardTitle>
            <CardDescription>Quantidade de veículos adicionados por dia</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingVehicles ? (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">Carregando...</p>
              </div>
            ) : vehiclesTrend && vehiclesTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={vehiclesTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#f97316" name="Veículos" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">Nenhum dado disponível</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Messages Received Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Mensagens Recebidas (Últimos 30 dias)</CardTitle>
            <CardDescription>Quantidade de leads gerados por dia</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingMessages ? (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">Carregando...</p>
              </div>
            ) : messagesTrend && messagesTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={messagesTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#1e40af" name="Mensagens" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">Nenhum dado disponível</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Most Viewed Vehicles */}
      <Card>
        <CardHeader>
          <CardTitle>Veículos Mais Visualizados</CardTitle>
          <CardDescription>Top 5 veículos com mais visualizações</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingMostViewed ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          ) : mostViewed && mostViewed.length > 0 ? (
            <div className="space-y-4">
              {mostViewed.map((vehicle, index) => (
                <div key={vehicle.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{vehicle.title}</p>
                      <p className="text-sm text-muted-foreground">
                        R$ {parseFloat(vehicle.price).toLocaleString('pt-BR')} • {vehicle.status}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    <span className="font-medium">{vehicle.views}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Nenhum veículo encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

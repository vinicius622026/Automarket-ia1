import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, Search, SlidersHorizontal, ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Cars() {
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState<string | undefined>();
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [transmission, setTransmission] = useState<string | undefined>();
  const [fuel, setFuel] = useState<string | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = trpc.cars.search.useQuery({
    search,
    brand,
    minPrice,
    maxPrice,
    transmission,
    fuel,
    status: "ACTIVE",
    limit: 20,
  });

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
          <h1 className="text-xl font-bold">Explorar Veículos</h1>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Filters Sidebar */}
          <aside className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Marca, modelo..."
                      className="pl-10"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Marca</label>
                  <Select value={brand} onValueChange={(v) => setBrand(v === "all" ? undefined : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="Toyota">Toyota</SelectItem>
                      <SelectItem value="Honda">Honda</SelectItem>
                      <SelectItem value="Ford">Ford</SelectItem>
                      <SelectItem value="Chevrolet">Chevrolet</SelectItem>
                      <SelectItem value="Volkswagen">Volkswagen</SelectItem>
                      <SelectItem value="Fiat">Fiat</SelectItem>
                      <SelectItem value="Hyundai">Hyundai</SelectItem>
                      <SelectItem value="Nissan">Nissan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Preço Mínimo</label>
                  <Input
                    type="number"
                    placeholder="R$ 0"
                    value={minPrice || ""}
                    onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Preço Máximo</label>
                  <Input
                    type="number"
                    placeholder="R$ 999.999"
                    value={maxPrice || ""}
                    onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Transmissão</label>
                  <Select value={transmission} onValueChange={(v) => setTransmission(v === "all" ? undefined : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="MANUAL">Manual</SelectItem>
                      <SelectItem value="AUTOMATIC">Automático</SelectItem>
                      <SelectItem value="CVT">CVT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Combustível</label>
                  <Select value={fuel} onValueChange={(v) => setFuel(v === "all" ? undefined : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="FLEX">Flex</SelectItem>
                      <SelectItem value="GASOLINE">Gasolina</SelectItem>
                      <SelectItem value="DIESEL">Diesel</SelectItem>
                      <SelectItem value="ELECTRIC">Elétrico</SelectItem>
                      <SelectItem value="HYBRID">Híbrido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSearch("");
                    setBrand(undefined);
                    setMinPrice(undefined);
                    setMaxPrice(undefined);
                    setTransmission(undefined);
                    setFuel(undefined);
                  }}
                >
                  Limpar Filtros
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* Results */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {data ? `${data.pagination.total} veículos encontrados` : "Carregando..."}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>

            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="aspect-video w-full" />
                    <CardContent className="p-4 space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-8 w-1/3 mt-4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : data && data.data.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {data.data.map((car) => (
                  <Link key={car.id} href={`/cars/${car.id}`}>
                    <Card className="card-hover overflow-hidden cursor-pointer">
                      <div className="aspect-video bg-muted flex items-center justify-center relative">
                        <Car className="h-12 w-12 text-muted-foreground" />
                        <Badge className="absolute top-2 right-2">{car.yearModel}</Badge>
                      </div>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div>
                            <h3 className="font-bold text-lg">
                              {car.brand} {car.model}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {car.version}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline">{car.transmission}</Badge>
                            <Badge variant="outline">{car.fuel}</Badge>
                            <Badge variant="outline">{car.mileage.toLocaleString('pt-BR')} km</Badge>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <div className="text-2xl font-bold text-primary">
                              R$ {Number(car.price).toLocaleString('pt-BR')}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum veículo encontrado</h3>
                  <p className="text-sm text-muted-foreground">
                    Tente ajustar os filtros para ver mais resultados
                  </p>
                </CardContent>
              </Card>
            )}

            {data && data.pagination.hasNext && (
              <div className="text-center">
                <Button variant="outline">Carregar Mais</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

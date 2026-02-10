import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Search, Car, Shield, Zap, TrendingUp, MessageSquare, Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: featuredCars } = trpc.cars.search.useQuery({
    status: "ACTIVE",
    limit: 6,
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Car className="h-6 w-6 text-primary" />
            <span>AutoMarket AI</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/cars" className="text-sm font-medium hover:text-primary transition-colors">
              Explorar
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <Link href="/cars/new">
                  <Button size="sm">Anunciar Veículo</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Entrar</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Criar Conta</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="mb-4">
              Marketplace Inteligente de Veículos
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Encontre o Veículo dos Seus Sonhos
            </h1>
            <p className="text-xl text-muted-foreground">
              Compre e venda veículos com segurança, transparência e tecnologia de ponta.
              Avaliações inteligentes, busca avançada e negociação direta.
            </p>

            {/* Search Bar */}
            <div className="flex gap-2 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por marca, modelo ou versão..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Link href={`/cars${searchQuery ? `?search=${searchQuery}` : ""}`}>
                <Button size="lg">Buscar</Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">1000+</div>
                <div className="text-sm text-muted-foreground">Veículos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Vendedores</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">4.8★</div>
                <div className="text-sm text-muted-foreground">Avaliação</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Por Que Escolher o AutoMarket AI?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tecnologia de ponta para uma experiência de compra e venda incomparável
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-hover">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Busca Inteligente</h3>
                <p className="text-muted-foreground">
                  Filtros avançados e busca semântica para encontrar exatamente o que você procura
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Segurança Total</h3>
                <p className="text-muted-foreground">
                  Verificação de vendedores, avaliações reais e sistema de moderação ativo
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Chat Direto</h3>
                <p className="text-muted-foreground">
                  Negocie diretamente com vendedores através do nosso sistema de mensagens
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-2">Avaliação IA</h3>
                <p className="text-muted-foreground">
                  Estimativa de preço baseada em dados de mercado e inteligência artificial
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-2">Avaliações</h3>
                <p className="text-muted-foreground">
                  Sistema de reviews transparente para garantir confiança nas transações
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Car className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-2">Para Lojas</h3>
                <p className="text-muted-foreground">
                  Planos especiais para revendas com importação em massa e API
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      {featuredCars && featuredCars.data.length > 0 && (
        <section className="py-20">
          <div className="container">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">
                  Veículos em Destaque
                </h2>
                <p className="text-muted-foreground">
                  Confira os anúncios mais recentes
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/cars">
                  <a>Ver Todos</a>
                </Link>
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCars.data.map((car) => (
                <Link key={car.id} href={`/cars/${car.id}`}>
                  <Card className="card-hover overflow-hidden">
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <Car className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-lg">
                            {car.brand} {car.model}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {car.version}
                          </p>
                        </div>
                        <Badge>{car.yearModel}</Badge>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-2xl font-bold text-primary">
                          R$ {Number(car.price).toLocaleString('pt-BR')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {car.mileage.toLocaleString('pt-BR')} km
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para Anunciar Seu Veículo?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Cadastre-se gratuitamente e comece a vender hoje mesmo. 
            Milhares de compradores esperando pelo seu anúncio.
          </p>
          <div className="flex gap-4 justify-center">
            {isAuthenticated ? (
              <Button size="lg" variant="secondary" asChild>
                <Link href="/cars/new">
                  <a>Criar Anúncio</a>
                </Link>
              </Button>
            ) : (
              <>
                            <Button size="lg" asChild>
                  <Link href="/signup">
                    <a>Começar Agora</a>
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10" asChild>
                  <Link href="/cars">
                    <a>Explorar Veículos</a>
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 font-bold text-lg mb-4">
                <Car className="h-5 w-5 text-primary" />
                <span>AutoMarket AI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                O marketplace mais inteligente para compra e venda de veículos.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Plataforma</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/cars"><a className="hover:text-foreground transition-colors">Explorar</a></Link></li>
                <li><Link href="/stores"><a className="hover:text-foreground transition-colors">Lojas</a></Link></li>
                <li><Link href="/signup"><a className="hover:text-foreground transition-colors">Anunciar</a></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2026 AutoMarket AI. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}

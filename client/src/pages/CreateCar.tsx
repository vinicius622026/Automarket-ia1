import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Car, Upload, X, Loader2 } from "lucide-react";

export default function CreateCar() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    version: "",
    yearFab: new Date().getFullYear(),
    yearModel: new Date().getFullYear(),
    price: "",
    mileage: "",
    transmission: "MANUAL" as "MANUAL" | "AUTOMATIC" | "CVT",
    fuel: "FLEX" as "FLEX" | "GASOLINE" | "DIESEL" | "ELECTRIC" | "HYBRID",
    color: "",
    description: "",
    features: [] as string[],
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [featureInput, setFeatureInput] = useState("");

  // Redirect if not authenticated
  if (!loading && !isAuthenticated) {
    setLocation("/login");
    return null;
  }

  const createCarMutation = trpc.cars.create.useMutation({
    onSuccess: async (data) => {
      toast.success("Anúncio criado com sucesso!");
      setLocation(`/cars/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 15) {
      toast.error("Máximo de 15 fotos permitidas");
      return;
    }
    setPhotos([...photos, ...files]);
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const addFeature = () => {
    if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()],
      });
      setFeatureInput("");
    }
  };

  const removeFeature = (feature: string) => {
    setFormData({
      ...formData,
      features: formData.features.filter((f) => f !== feature),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.brand || !formData.model || !formData.version) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (formData.yearModel < formData.yearFab) {
      toast.error("Ano do modelo não pode ser anterior ao ano de fabricação");
      return;
    }

    createCarMutation.mutate({
      brand: formData.brand,
      model: formData.model,
      version: formData.version,
      yearFab: formData.yearFab,
      yearModel: formData.yearModel,
      price: parseFloat(formData.price),
      mileage: parseInt(formData.mileage),
      transmission: formData.transmission as "MANUAL" | "AUTOMATIC" | "CVT",
      fuel: formData.fuel as "FLEX" | "GASOLINE" | "DIESEL" | "ELECTRIC" | "HYBRID",
      color: formData.color,
      description: formData.description,
      features: formData.features,
    });
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

      <div className="container max-w-4xl py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Criar Novo Anúncio</h1>
          <p className="text-muted-foreground">Preencha as informações do seu veículo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>Dados principais do veículo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Marca *</Label>
                  <Input
                    id="brand"
                    placeholder="Ex: Toyota"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Modelo *</Label>
                  <Input
                    id="model"
                    placeholder="Ex: Corolla"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="version">Versão *</Label>
                <Input
                  id="version"
                  placeholder="Ex: 2.0 XEI Automático"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="yearFab">Ano de Fabricação *</Label>
                  <Input
                    id="yearFab"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={formData.yearFab}
                    onChange={(e) => setFormData({ ...formData, yearFab: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearModel">Ano do Modelo *</Label>
                  <Input
                    id="yearModel"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={formData.yearModel}
                    onChange={(e) => setFormData({ ...formData, yearModel: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="50000.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mileage">Quilometragem (km) *</Label>
                  <Input
                    id="mileage"
                    type="number"
                    min="0"
                    placeholder="50000"
                    value={formData.mileage}
                    onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transmission">Câmbio *</Label>
                  <Select
                    value={formData.transmission}
                    onValueChange={(value) => setFormData({ ...formData, transmission: value as "MANUAL" | "AUTOMATIC" | "CVT" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MANUAL">Manual</SelectItem>
                      <SelectItem value="AUTOMATIC">Automático</SelectItem>
                      <SelectItem value="CVT">CVT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fuel">Combustível *</Label>
                  <Select
                    value={formData.fuel}
                    onValueChange={(value) => setFormData({ ...formData, fuel: value as "FLEX" | "GASOLINE" | "DIESEL" | "ELECTRIC" | "HYBRID" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FLEX">Flex</SelectItem>
                      <SelectItem value="GASOLINE">Gasolina</SelectItem>
                      <SelectItem value="DIESEL">Diesel</SelectItem>
                      <SelectItem value="ELECTRIC">Elétrico</SelectItem>
                      <SelectItem value="HYBRID">Híbrido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Cor *</Label>
                  <Input
                    id="color"
                    placeholder="Ex: Preto"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Descrição</CardTitle>
              <CardDescription>Descreva o veículo em detalhes</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Descreva o estado do veículo, histórico, diferenciais..."
                rows={5}
                maxLength={2000}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <p className="text-sm text-muted-foreground mt-2">
                {formData.description.length}/2000 caracteres
              </p>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Opcionais</CardTitle>
              <CardDescription>Adicione os itens de série e opcionais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: Ar condicionado"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                />
                <Button type="button" onClick={addFeature}>
                  Adicionar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1 rounded-full"
                  >
                    <span className="text-sm">{feature}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(feature)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Photos */}
          <Card>
            <CardHeader>
              <CardTitle>Fotos</CardTitle>
              <CardDescription>Adicione até 15 fotos do veículo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <Label htmlFor="photos" className="cursor-pointer">
                  <span className="text-primary hover:underline">Clique para selecionar</span>
                  <span className="text-muted-foreground"> ou arraste as fotos aqui</span>
                  <Input
                    id="photos"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </Label>
                <p className="text-sm text-muted-foreground mt-2">
                  {photos.length}/15 fotos adicionadas
                </p>
              </div>

              {photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="submit"
              size="lg"
              className="flex-1"
              disabled={createCarMutation.isPending}
            >
              {createCarMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando anúncio...
                </>
              ) : (
                "Criar Anúncio"
              )}
            </Button>
            <Link href="/dashboard">
              <Button type="button" variant="outline" size="lg">
                Cancelar
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

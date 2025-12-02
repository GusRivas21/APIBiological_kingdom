import { Button } from "@/components/ui/button";
import heroTree from "@/assets/hero-tree.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-[99vh] flex items-center pt-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20" />

      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-up">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              API Taxonómica de {" "}
              <span className="text-gradient-primary">Reinos Biológicos</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg">
              Descubre el poder de acceder a datos taxonómicos completos y actualizados de todos los reinos biológicos mediante nuestra API RESTful.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button variant="hero" size="lg" onClick={() => window.location.href = "http://localhost:3000/doc/"}>
                Empezar a Usar la API
              </Button>
              <Button
                variant="heroOutline"
                size="lg"
                onClick={() => {
                  const element = document.getElementById("species"); 
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                Ver Ejemplos Rápidos
              </Button>

            </div>
          </div>

          <div className="relative lg:h-[500px] animate-float">
            <img
              src={heroTree}
              alt="Árbol de la vida digital"
              className="w-full h-full object-contain rounded-2xl"
            />
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background/20 to-transparent rounded-t-2xl" />

          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

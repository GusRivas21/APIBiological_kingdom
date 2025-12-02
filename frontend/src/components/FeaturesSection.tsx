import { Building, Layers, Zap } from "lucide-react";

const features = [
  {
    icon: Building,
    title: "Coherencia RESTful",
    points: ["Convenciones HTTP claras y consistentes", "Respuestas JSON estandarizadas"],
  },
  {
    icon: Layers,
    title: "Jerarquía Completa",
    points: ["Acceso a toda la clasificación taxonómica", "Desde reino hasta especie"],
  },
  {
    icon: Zap,
    title: "Velocidad y Escalabilidad",
    points: ["Servidores de alto rendimiento", "Caché inteligente y CDN global"],
  },
];

const codeExample = `// Request to API Key
{
  
  "scientific_name": "Pan troglodytes",
  "common_name": "Chimpancé",
  "conservation_status": "En peligro"
  
}`;

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-card/50">
      <div className="container mx-auto px-6">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-16">
          ¿Por Qué Nuestra API?
        </h2>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Code example */}
          <div className="lg:col-span-1 space-y-4">
            <p className="text-sm text-muted-foreground">Respuesta de API Key</p>
            <div className="bg-secondary rounded-xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="font-mono text-sm">Hello World</span>
              </div>
              <pre className="font-mono text-xs text-muted-foreground overflow-x-auto">
                <code>{codeExample}</code>
              </pre>
            </div>
            <div className="flex gap-2">
              {["cURL", "Python", "JavaScript"].map((lang) => (
                <button
                  key={lang}
                  className="px-3 py-1.5 text-xs font-medium bg-secondary rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Feature cards */}
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="card-glass rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-3">
                {feature.title}
              </h3>
              <ul className="space-y-2">
                {feature.points.map((point) => (
                  <li
                    key={point}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="text-primary mt-1">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

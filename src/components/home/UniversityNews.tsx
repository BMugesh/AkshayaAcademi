import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Newspaper, Clock, Globe, ArrowRight, X, Building2, Calendar, BookOpen } from "lucide-react";
import { useNews, useNewsArticle, type NewsArticle } from "@/hooks/useNews";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CATEGORY_COLORS: Record<string, string> = {
  "Admission Updates": "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/20",
  "Scholarships": "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/20",
  "University Rankings": "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/20",
  "Placements": "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 border-purple-500/20",
  "Visa & Immigration": "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 border-orange-500/20",
  "Campus Updates": "bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400 border-teal-500/20",
  "General Education": "bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400 border-gray-500/20",
};

// Fallback data when API news is empty
const STATIC_FALLBACKS: NewsArticle[] = [
  {
    _id: "fb-1",
    title: "MIT Retains #1 Spot in QS World University Rankings 2025",
    slug: "mit-retains-1-spot",
    summary: "MIT has maintained its top position for the 13th consecutive year, excelling in employer reputation and research output across engineering disciplines.",
    content: "<p>Massachusetts Institute of Technology (MIT) has once again secured the number one position in the QS World University Rankings for 2025. This marks the 13th consecutive year that the institution has led the global table.</p><p>The rankings evaluate universities based on academic reputation, employer reputation, faculty/student ratio, citations per faculty, and international faculty/student ratio. MIT scored exceptionally high across all metrics, particularly in employer reputation and academic impact.</p>",
    featuredImage: "https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=800&q=80",
    category: "University Rankings",
    tags: ["MIT", "Rankings"],
    universityName: "MIT",
    country: "USA",
    author: "Akshaya Akademics",
    status: "published",
    featured: true,
    views: 120,
    publishDate: "2026-05-15T00:00:00.000Z",
    createdAt: "2026-05-15T00:00:00.000Z",
    updatedAt: "2026-05-15T00:00:00.000Z",
  },
  {
    _id: "fb-2",
    title: "Oxford Launches £50M Global Scholarship Fund for 2026 Intake",
    slug: "oxford-scholarships-2026",
    summary: "University of Oxford announces an unprecedented scholarship programme supporting 500 international students annually in STEM, humanities, and social sciences.",
    content: "<p>The University of Oxford has announced a new £50 million scholarship initiative targeted at high-achieving international students for the 2026 academic year.</p><p>The fund will support up to 500 students annually, covering tuition fees and providing a generous monthly stipend. Scholarships will be awarded across various departments, with a strong focus on promoting diversity in STEM fields and humanitarian studies.</p>",
    featuredImage: "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=800&q=80",
    category: "Scholarships",
    tags: ["Oxford", "Scholarship"],
    universityName: "University of Oxford",
    country: "UK",
    author: "Akshaya Akademics",
    status: "published",
    featured: true,
    views: 95,
    publishDate: "2026-05-10T00:00:00.000Z",
    createdAt: "2026-05-10T00:00:00.000Z",
    updatedAt: "2026-05-10T00:00:00.000Z",
  },
  {
    _id: "fb-3",
    title: "Canada Opens New 3-Year Post-Study Work Permit for Graduates",
    slug: "canada-3-year-work-permit",
    summary: "Immigration Canada expands post-graduation work permit eligibility, allowing graduates from 200+ designated institutions to work for up to 3 years.",
    content: "<p>Canada is introducing flexible measures for international graduates, extending post-graduation work permits (PGWP) up to three years for qualified master's and doctoral degrees.</p><p>This policy change aims to retain global talent and boost Canada's knowledge economy. Candidates must have graduated from a designated learning institution (DLI) and met the minimum language proficiency requirements.</p>",
    featuredImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80",
    category: "Visa & Immigration",
    tags: ["Canada", "Visa", "PGWP"],
    universityName: "University of Toronto",
    country: "Canada",
    author: "Akshaya Akademics",
    status: "published",
    featured: true,
    views: 250,
    publishDate: "2026-04-20T00:00:00.000Z",
    createdAt: "2026-04-20T00:00:00.000Z",
    updatedAt: "2026-04-20T00:00:00.000Z",
  },
];

const NewsCardSkeleton = () => (
  <div className="border border-border/50 rounded-2xl p-4 bg-card shadow-sm space-y-4 animate-pulse">
    <div className="aspect-[16/10] bg-muted/40 rounded-xl" />
    <div className="flex gap-2">
      <div className="h-5 w-20 bg-muted/40 rounded-full" />
      <div className="h-5 w-24 bg-muted/40 rounded-full" />
    </div>
    <div className="h-6 w-5/6 bg-muted/40 rounded-md" />
    <div className="space-y-2">
      <div className="h-4 w-full bg-muted/40 rounded-md" />
      <div className="h-4 w-3/4 bg-muted/40 rounded-md" />
    </div>
    <div className="flex justify-between items-center pt-2">
      <div className="h-4 w-28 bg-muted/40 rounded-md" />
      <div className="h-4 w-16 bg-muted/40 rounded-md" />
    </div>
  </div>
);

const ArticleModal = ({ slug, onClose }: { slug: string; onClose: () => void }) => {
  const { data, isLoading } = useNewsArticle(slug);
  
  // Fallback to static data if backend doesn't have the article
  const fallbackArticle = STATIC_FALLBACKS.find((a) => a.slug === slug);
  const article = data?.article || fallbackArticle;
  const isReallyLoading = isLoading && !fallbackArticle;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-background rounded-3xl shadow-2xl w-full max-w-3xl border border-border/50 max-h-[85vh] flex flex-col overflow-hidden relative mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-background/80 hover:bg-muted flex items-center justify-center border border-border shadow-sm transition-colors text-foreground"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        {isReallyLoading ? (
          <div className="p-8 space-y-6 flex-1 overflow-y-auto animate-pulse">
            <div className="aspect-[21/9] bg-muted/40 rounded-2xl" />
            <div className="h-8 w-3/4 bg-muted/40 rounded-md" />
            <div className="flex gap-4">
              <div className="h-5 w-24 bg-muted/40 rounded-md" />
              <div className="h-5 w-32 bg-muted/40 rounded-md" />
            </div>
            <div className="space-y-3">
              <div className="h-4 w-full bg-muted/40 rounded-md" />
              <div className="h-4 w-full bg-muted/40 rounded-md" />
              <div className="h-4 w-5/6 bg-muted/40 rounded-md" />
            </div>
          </div>
        ) : article ? (
          <div className="flex-1 overflow-y-auto">
            {/* Header Image */}
            {article.featuredImage && (
              <div className="relative aspect-[21/9] w-full overflow-hidden border-b border-border/50">
                <img
                  src={article.featuredImage}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              </div>
            )}

            {/* Content Details */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className={cn("px-3 py-1 rounded-full text-xs font-semibold border", CATEGORY_COLORS[article.category] || "bg-accent/10 text-accent")}>
                  {article.category}
                </span>
                {(article.publishDate || article.createdAt) && (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    {format(new Date(article.publishDate || article.createdAt), "MMMM dd, yyyy")}
                  </span>
                )}
              </div>

              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight">
                {article.title}
              </h2>

              {/* Sub-strip for references */}
              {(article.universityName || article.country) && (
                <div className="flex flex-wrap items-center gap-4 py-3 border-y border-border/40 text-sm">
                  {article.universityName && (
                    <div className="flex items-center gap-1.5 text-foreground/80 font-medium">
                      <Building2 className="w-4 h-4 text-accent" />
                      <span>{article.universityName}</span>
                    </div>
                  )}
                  {article.country && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Globe className="w-4 h-4" />
                      <span>{article.country}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Rich Content body */}
              <div
                className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 leading-relaxed text-base space-y-4"
                dangerouslySetInnerHTML={{ __html: article.content || `<p>${article.summary}</p>` }}
              />

              {article.sourceUrl && (
                <div className="pt-4">
                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
                  >
                    <Globe className="w-4 h-4" />
                    Visit Original Source Website
                  </a>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground flex-1 flex flex-col items-center justify-center">
            <BookOpen className="w-12 h-12 mb-3 text-muted-foreground/40" />
            <p className="text-lg">Failed to load article content.</p>
            <Button onClick={onClose} variant="link" className="text-accent mt-2">Close</Button>
          </div>
        )}

        <div className="p-4 border-t border-border/40 bg-secondary/10 flex justify-end">
          <Button onClick={onClose} variant="secondary">Close</Button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

const UniversityNews = () => {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const { data, isLoading } = useNews({ limit: 6 });
  
  const rawArticles = data?.articles ?? [];
  const displayArticles = rawArticles.length > 0 ? rawArticles : STATIC_FALLBACKS;

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern-light opacity-30 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-4 border border-accent/20">
            <Newspaper className="w-4 h-4" />
            University News & Updates
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-4">
            Latest University Updates
          </h2>
          <p className="text-lg text-muted-foreground">
            Stay informed with the latest updates on admissions, rankings, and opportunities from globally renowned universities.
          </p>
        </motion.div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <NewsCardSkeleton key={`skeleton-${idx}`} />
            ))
          ) : (
            displayArticles.map((article) => (
              <motion.article
                key={article._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group flex flex-col bg-card border border-border/50 hover:border-accent/40 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Featured Image */}
                <div className="aspect-[16/10] overflow-hidden relative bg-muted/20">
                  <img
                    src={article.featuredImage || "https://images.unsplash.com/photo-1523289333742-be1143f6b766?w=800&q=80"}
                    alt={article.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />
                </div>

                {/* Card Info */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className={cn("px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border", CATEGORY_COLORS[article.category] || "bg-accent/10 text-accent")}>
                        {article.category}
                      </span>
                      {(article.publishDate || article.createdAt) && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          {format(new Date(article.publishDate || article.createdAt), "MMM dd, yyyy")}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-foreground leading-snug group-hover:text-accent transition-colors line-clamp-2">
                      {article.title}
                    </h3>

                    <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-border/40">
                    {/* Related University */}
                    {article.universityName ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/80 max-w-[60%] truncate">
                        <Building2 className="w-3.5 h-3.5 text-accent shrink-0" />
                        <span className="truncate">{article.universityName}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Globe className="w-3.5 h-3.5" />
                        Akshaya Academi
                      </span>
                    )}

                    {/* Read More button trigger */}
                    <button
                      onClick={() => setSelectedSlug(article.slug)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-accent group/btn"
                    >
                      Read More
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))
          )}
        </div>

        {/* View Modal */}
        <AnimatePresence>
          {selectedSlug && (
            <ArticleModal slug={selectedSlug} onClose={() => setSelectedSlug(null)} />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default UniversityNews;

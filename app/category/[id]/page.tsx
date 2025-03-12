import { Suspense } from "react";
import { notFound } from "next/navigation";
import { categories, getGamesByCategory } from "@/lib/games-data";
import GamesGrid from "@/components/games-grid";
import CategoryFilter from "@/components/category-filter";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export function generateStaticParams() {
  return categories.map((category) => ({
    id: category.id,
  }));
}

export const dynamic = "force-dynamic";
export const revalidate = 0; // Disable static generation completely

export default async function CategoryPage({ params }: PageProps) {
  // Await the params since they're now a Promise
  const { id: categoryId } = await params;
  const category = categories.find((c) => c.id === categoryId);

  if (!category) {
    notFound();
  }

  const games = getGamesByCategory(category.id);

  return (
    <div className="space-y-8">
      <section className="py-6">
        <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
        <p className="mt-2 text-muted-foreground">{category.description}</p>
      </section>

      <CategoryFilter />

      <Suspense fallback={<div>Loading games...</div>}>
        <GamesGrid games={games} />
      </Suspense>
    </div>
  );
}

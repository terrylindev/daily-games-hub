import { Suspense } from "react";
import { notFound } from "next/navigation";
import { categories } from "@/lib/games-data";
import { getGamesByCategory as getGamesByCategoryFromDB } from "@/lib/game-utils";
import { getCategoryCounts } from "@/lib/db";
import GamesGrid from "@/components/games-grid";
import CategoryFilter from "@/components/category-filter";
import type { Metadata } from "next";
import { BreadcrumbJSONLD } from "@/components/json-ld";

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

// Generate metadata for each category page
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id: categoryId } = await params;
  const category = categories.find((c) => c.id === categoryId);

  if (!category) {
    return {
      title: "Category Not Found",
      description: "The requested category could not be found.",
    };
  }

  return {
    title: `${category.name} Games | Daily Games Hub`,
    description: `Discover and play the best ${category.name.toLowerCase()} games. ${
      category.description
    }`,
    alternates: {
      canonical: `/category/${category.id}`,
    },
    openGraph: {
      title: `${category.name} Games | Daily Games Hub`,
      description: `Discover and play the best ${category.name.toLowerCase()} games. ${
        category.description
      }`,
      url: `https://dailygameshub.com/category/${category.id}`,
      type: "website",
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  // Await the params since they're now a Promise
  const { id: categoryId } = await params;
  const category = categories.find((c) => c.id === categoryId);

  if (!category) {
    notFound();
  }

  // Use the MongoDB function to get games by category
  const gamesFromDB = await getGamesByCategoryFromDB(category.id);
  
  // Fetch category counts from cached database
  const categoryCounts = await getCategoryCounts();
  
  console.log(
    `Category page: Retrieved ${gamesFromDB.length} games for category ${category.id}`
  );

  return (
    <div className="space-y-8">
      <BreadcrumbJSONLD
        items={[
          { name: "Home", item: "https://dailygameshub.com/" },
          {
            name: category.name,
            item: `https://dailygameshub.com/category/${category.id}`,
          },
        ]}
      />

      <section className="py-6">
        <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
        <p className="mt-2 text-muted-foreground">{category.description}</p>
      </section>

      <CategoryFilter categoryCounts={categoryCounts} />

      <Suspense fallback={<div>Loading games...</div>}>
        <GamesGrid games={gamesFromDB} />
      </Suspense>
    </div>
  );
}

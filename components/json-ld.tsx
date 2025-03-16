import React from "react";

interface WebsiteJSONLDProps {
  url: string;
  name: string;
  description: string;
}

export function WebsiteJSONLD({ url, name, description }: WebsiteJSONLDProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url,
    name,
    description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface GameJSONLDProps {
  name: string;
  description: string;
  url: string;
  category: string;
  tags: string[];
}

export function GameJSONLD({
  name,
  description,
  url,
  category,
  tags,
}: GameJSONLDProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    applicationCategory: "GameApplication",
    applicationSubCategory: category,
    url,
    keywords: tags.join(", "),
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface BreadcrumbJSONLDProps {
  items: Array<{
    name: string;
    item: string;
  }>;
}

export function BreadcrumbJSONLD({ items }: BreadcrumbJSONLDProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

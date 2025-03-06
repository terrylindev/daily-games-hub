export default function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background">
      <div className="container flex flex-col items-center justify-center gap-4 py-10 md:h-24 md:py-0">
        <div className="flex flex-col items-center gap-4 px-8">
          <p className="text-center text-sm leading-loose text-muted-foreground">
            &copy; {new Date().getFullYear()} Daily Games Hub. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

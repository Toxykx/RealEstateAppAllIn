export function SiteFooter() {
  return (
    <footer className="border-t py-8">
      <div className="mx-auto max-w-6xl px-4 text-sm text-muted-foreground sm:px-6">
        <p>&copy; {new Date().getFullYear()} אופק נכסים. כל הזכויות שמורות.</p>
      </div>
    </footer>
  );
}

# Layout and charts

## Page section with Card and Tabs

```jsx
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';

function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground">View and export reports.</p>
      </div>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="exports">Exports</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
            <CardContent>...</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="exports">...</TabsContent>
      </Tabs>
    </div>
  );
}
```

## Charts and design tokens

Use Recharts (or your chart library) with colors that match the design system. In `src/index.css`, chart variables are defined (e.g. `--chart-1` … `--chart-5`). Prefer these or semantic tokens so charts look good in both light and dark mode.

Example pattern:

- Use `hsl(var(--chart-1))` etc. for series colors.
- Keep axes and labels with `text-muted-foreground` or equivalent so they respect theme.
- Wrap the chart in a `Card` for consistent padding and border.

## Breadcrumb in layout

The layout already renders `BreadcrumbNav` (from `src/components/ui/breadcrumb.jsx`) below the header. It derives segments from the current route and uses a `pathLabels` map (and `t` for i18n). To add new routes, extend `defaultPathLabels` in `breadcrumb.jsx` or pass a custom `pathLabels` prop to `BreadcrumbNav`.

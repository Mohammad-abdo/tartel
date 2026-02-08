# Form examples

Use design tokens and shared components for all form fields so they stay consistent and theme-aware.

## Basic form with Input and Button

```jsx
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

function LoginForm() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" />
        </div>
        <Button type="submit" className="w-full">Submit</Button>
      </CardContent>
    </Card>
  );
}
```

## Form with Switch and validation message (Alert)

```jsx
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription, AlertTitle, AlertIcon } from '../components/ui/alert';

function SettingsForm() {
  const [enabled, setEnabled] = useState(false);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Switch id="notify" checked={enabled} onCheckedChange={setEnabled} />
        <Label htmlFor="notify">Email notifications</Label>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertIcon variant="destructive" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
```

## RTL support

Keep `dir` and logical classes (e.g. `ms-2`, `me-2` or padding start/end) in mind when building forms so they work in both LTR and RTL (e.g. Arabic). Use `useLanguage()` and semantic tokens for text and borders.

# Data table and grid examples

Use the Table components for tabular data and Card grids for dashboard KPI or list layouts.

## Sortable-style table (structure)

Table components are in `src/components/ui/table.jsx`. Sorting logic is left to the page (e.g. state + sort key).

```jsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

function UsersTable({ users }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell className="text-right">...</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
```

## Dashboard KPI cards grid

Use Card with design tokens so cards respect light/dark theme.

```jsx
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

function StatsGrid({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.id}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            {stat.change != null && (
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

## Empty and loading states

- **Loading**: use `Skeleton` from `src/components/ui/skeleton.jsx` for rows or cards.
- **Empty**: use Card + message + primary Button; keep text with `text-muted-foreground` and actions with `Button` (primary variant).

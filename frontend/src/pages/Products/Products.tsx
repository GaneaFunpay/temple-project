import {
  Box,
  Container,
  Divider,
  Drawer,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Rating,
  Select,
  Slider,
  Stack,
  Switch,
  TextField,
  Toolbar,
  Typography,
  Button,
  useMediaQuery,
} from "@mui/material";
import { FilterList, Tune } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";

// ----- Dummy data -----
type Product = {
  id: number;
  title: string;
  price: number; // cents or currency units – тут просто units
  rating: number; // 0..5
  category: "Electronics" | "Books" | "Home" | "Apparel";
  inStock: boolean;
  image: string;
  tags?: string[];
};

const PRODUCTS: Product[] = [
  {
    id: 1,
    title: "Noise-Cancel Headphones",
    price: 199,
    rating: 4.6,
    category: "Electronics",
    inStock: true,
    image: "https://picsum.photos/seed/p1/640/480",
    tags: ["wireless", "new"],
  },
  {
    id: 2,
    title: "Smartwatch X2",
    price: 149,
    rating: 4.1,
    category: "Electronics",
    inStock: true,
    image: "https://picsum.photos/seed/p2/640/480",
  },
  {
    id: 3,
    title: "Running Sneakers",
    price: 89,
    rating: 4.3,
    category: "Apparel",
    inStock: false,
    image: "https://picsum.photos/seed/p3/640/480",
  },
  {
    id: 4,
    title: "Ergonomic Chair",
    price: 299,
    rating: 4.8,
    category: "Home",
    inStock: true,
    image: "https://picsum.photos/seed/p4/640/480",
    tags: ["bestseller"],
  },
  {
    id: 5,
    title: "Espresso Maker",
    price: 129,
    rating: 4.2,
    category: "Home",
    inStock: true,
    image: "https://picsum.photos/seed/p5/640/480",
  },
  {
    id: 6,
    title: "TypeScript Handbook",
    price: 39,
    rating: 4.7,
    category: "Books",
    inStock: true,
    image: "https://picsum.photos/seed/p6/640/480",
    tags: ["hot"],
  },
  {
    id: 7,
    title: "Minimal Hoodie",
    price: 59,
    rating: 4.0,
    category: "Apparel",
    inStock: true,
    image: "https://picsum.photos/seed/p7/640/480",
  },
  {
    id: 8,
    title: "Air Purifier",
    price: 179,
    rating: 4.4,
    category: "Home",
    inStock: false,
    image: "https://picsum.photos/seed/p8/640/480",
  },
  {
    id: 9,
    title: "Bluetooth Speaker",
    price: 69,
    rating: 4.3,
    category: "Electronics",
    inStock: true,
    image: "https://picsum.photos/seed/p9/640/480",
  },
  {
    id: 10,
    title: "Cookbook: Street Food",
    price: 24,
    rating: 4.5,
    category: "Books",
    inStock: true,
    image: "https://picsum.photos/seed/p10/640/480",
  },
  {
    id: 11,
    title: "Desk Lamp Pro",
    price: 49,
    rating: 3.9,
    category: "Home",
    inStock: true,
    image: "https://picsum.photos/seed/p11/640/480",
  },
  {
    id: 12,
    title: "Classic T-Shirt",
    price: 19,
    rating: 4.1,
    category: "Apparel",
    inStock: true,
    image: "https://picsum.photos/seed/p12/640/480",
  },
];

// ----- Helpers -----
const categories = ["All", "Electronics", "Books", "Home", "Apparel"] as const;
type CategoryFilter = (typeof categories)[number];

type SortKey = "relevance" | "price_asc" | "price_desc" | "rating_desc";

// ----- Sidebar Filters -----
type Filters = {
  query: string;
  category: CategoryFilter;
  price: number[]; // [min, max]
  minRating: number;
  inStockOnly: boolean;
  sortBy: SortKey;
};

function FilterSidebar({
  value,
  onChange,
}: {
  value: Filters;
  onChange: (patch: Partial<Filters>) => void;
}) {
  return (
    <Stack spacing={3} sx={{ p: 2 }}>
      <Typography variant="h6">Filters</Typography>

      <TextField
        label="Search"
        size="small"
        value={value.query}
        onChange={(e) => onChange({ query: e.target.value })}
      />

      <FormControl size="small" fullWidth>
        <InputLabel>Category</InputLabel>
        <Select
          label="Category"
          value={value.category}
          onChange={(e) =>
            onChange({ category: e.target.value as CategoryFilter })
          }
        >
          {categories.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box>
        <Typography gutterBottom>Price range</Typography>
        <Slider
          value={value.price}
          onChange={(_, v) => onChange({ price: v as number[] })}
          valueLabelDisplay="auto"
          min={0}
          max={400}
          step={5}
          marks={[
            { value: 0, label: "$0" },
            { value: 200, label: "$200" },
            { value: 400, label: "$400" },
          ]}
        />
      </Box>

      <Box>
        <Typography gutterBottom>Min rating</Typography>
        <Rating
          value={value.minRating}
          precision={0.5}
          onChange={(_, v) => onChange({ minRating: v ?? 0 })}
        />
      </Box>

      <FormControlLabel
        control={
          <Switch
            checked={value.inStockOnly}
            onChange={(e) => onChange({ inStockOnly: e.target.checked })}
          />
        }
        label="Only in stock"
      />

      <Divider />

      <FormControl size="small" fullWidth>
        <InputLabel>Sort by</InputLabel>
        <Select
          label="Sort by"
          value={value.sortBy}
          onChange={(e) => onChange({ sortBy: e.target.value as SortKey })}
        >
          <MenuItem value="relevance">Relevance</MenuItem>
          <MenuItem value="price_asc">Price ↑</MenuItem>
          <MenuItem value="price_desc">Price ↓</MenuItem>
          <MenuItem value="rating_desc">Rating</MenuItem>
        </Select>
      </FormControl>

      <Button
        variant="outlined"
        onClick={() =>
          onChange({
            query: "",
            category: "All",
            price: [0, 400],
            minRating: 0,
            inStockOnly: false,
            sortBy: "relevance",
          })
        }
      >
        Reset
      </Button>

      <Typography variant="caption" color="text.secondary">
        * Всё демо, дальше можно подключить API / RTK Query.
      </Typography>
    </Stack>
  );
}

// ----- Main page -----
export default function Products() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const [filters, setFilters] = useState<Filters>({
    query: "",
    category: "All",
    price: [0, 400],
    minRating: 0,
    inStockOnly: false,
    sortBy: "relevance",
  });
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handlePatch = (patch: Partial<Filters>) =>
    setFilters((f) => ({ ...f, ...patch }));

  const filtered = useMemo(() => {
    let list = PRODUCTS.slice();

    // search
    const q = filters.query.trim().toLowerCase();
    if (q) list = list.filter((p) => p.title.toLowerCase().includes(q));

    // category
    if (filters.category !== "All")
      list = list.filter((p) => p.category === filters.category);

    // price
    const [minP, maxP] = filters.price;
    list = list.filter((p) => p.price >= minP && p.price <= maxP);

    // rating
    if (filters.minRating > 0)
      list = list.filter((p) => p.rating >= filters.minRating);

    // stock
    if (filters.inStockOnly) list = list.filter((p) => p.inStock);

    // sort
    switch (filters.sortBy) {
      case "price_asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating_desc":
        list.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // relevance (просто оставим исходный порядок)
        break;
    }
    return list;
  }, [filters]);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Top bar */}
      <Stack direction="row" alignItems="center" gap={2} sx={{ mb: 2 }}>
        {!isMdUp && (
          <IconButton onClick={() => setDrawerOpen(true)}>
            <FilterList />
          </IconButton>
        )}
        <TextField
          fullWidth
          placeholder="Search products…"
          value={filters.query}
          onChange={(e) => handlePatch({ query: e.target.value })}
          size="small"
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Sort by</InputLabel>
          <Select
            label="Sort by"
            value={filters.sortBy}
            onChange={(e) => handlePatch({ sortBy: e.target.value as SortKey })}
          >
            <MenuItem value="relevance">Relevance</MenuItem>
            <MenuItem value="price_asc">Price ↑</MenuItem>
            <MenuItem value="price_desc">Price ↓</MenuItem>
            <MenuItem value="rating_desc">Rating</MenuItem>
          </Select>
        </FormControl>
        <IconButton sx={{ display: { xs: "none", md: "inline-flex" } }}>
          <Tune />
        </IconButton>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { md: "280px 1fr" },
          gap: 3,
        }}
      >
        {/* Sidebar (desktop) */}
        <Box
          sx={{
            display: { xs: "none", md: "block" },
            position: "sticky",
            top: 16,
            height: "fit-content",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <FilterSidebar value={filters} onChange={handlePatch} />
        </Box>

        {/* Drawer (mobile) */}
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          sx={{ display: { md: "none" } }}
        >
          <Box role="presentation" sx={{ width: 300 }}>
            <Toolbar />
            <FilterSidebar
              value={filters}
              onChange={(patch) => {
                handlePatch(patch);
                // можешь закрывать drawer при изменении
              }}
            />
          </Box>
        </Drawer>

        {/* Grid of cards */}
        <Box>
          <Box
            display="grid"
            gridTemplateColumns={{
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)",
            }}
            gap={2}
          >
            {filtered.map((p) => (
              <Box key={p.id}>
                <ProductCard p={p} />
              </Box>
            ))}
          </Box>

          {filtered.length === 0 && (
            <Box sx={{ textAlign: "center", py: 8, color: "text.secondary" }}>
              <Typography variant="h6">Nothing found</Typography>
              <Typography variant="body2">
                Try changing filters or search query.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
}

import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Rating,
  Stack,
  Typography,
} from "@mui/material";

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

const ProductCard = ({ p }: { p: Product }) => {
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardActionArea sx={{ flexGrow: 1 }}>
        <CardMedia component="img" height={180} image={p.image} alt={p.title} />
        <CardContent>
          <Stack spacing={1}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              noWrap
              title={p.title}
            >
              {p.title}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Rating value={p.rating} precision={0.1} readOnly size="small" />
              <Typography variant="caption" color="text.secondary">
                {p.rating.toFixed(1)}
              </Typography>
            </Stack>
            <Typography variant="h6">${p.price}</Typography>
            <Stack direction="row" flexWrap="wrap" gap={0.5}>
              <Chip size="small" label={p.category} />
              {!p.inStock && (
                <Chip size="small" color="warning" label="Out of stock" />
              )}
              {p.tags?.map((t) => (
                <Chip key={t} size="small" label={t} variant="outlined" />
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>
      <Box sx={{ p: 2, pt: 0 }}>
        <Button fullWidth variant="contained" disabled={!p.inStock}>
          Add to cart
        </Button>
      </Box>
    </Card>
  );
};

export default ProductCard;

export interface FoodItem {
  id: string;               // optional – ako koristiš bazu
  name: string;              // npr. "Banana"
  quantity: number;          // količina (u gramima)
  unit: 'g' | 'ml' | 'pcs';  // jedinica
  calories?: number;          // kalorije za tu količinu
  proteins?: number;
  fats?: number;
  carbs?: number;
}

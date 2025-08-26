import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { DailyLogService } from 'src/app/services/daily-log.service';

@Component({
  selector: 'app-food-details',
  templateUrl: './food-details.page.html',
  styleUrls: ['./food-details.page.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
})
export class FoodDetailsPage implements OnInit {
  barcode = '';
  product?: {
    name: string;
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    unit: string;
    default_quantity: number;
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private dailyLog: DailyLogService
  ) {}

  async ngOnInit() {
    this.barcode = this.route.snapshot.queryParamMap.get('barcode') || '';
    // TODO: zamijeni s tvojim ProductService-om / OpenFoodFacts pozivom
    this.product = await this.mockFetchProduct(this.barcode);
  }

  async addToMeal() {
    const uid = this.auth.getUserId()!;
    const mealId = this.route.snapshot.queryParamMap.get('mealId')!;
    const date = this.route.snapshot.queryParamMap.get('date')!;

    if (!this.product) return;

   /*  await this.dailyLog.addItemToMeal(uid, date, mealId, {
      name: this.product.name,
      calories: this.product.calories,
      proteins: this.product.proteins,
      carbs: this.product.carbs,
      fats: this.product.fats,
      unit: this.product.unit,
      default_quantity: this.product.default_quantity,
      // … što god ti je u FoodItem modelu
    }); */

    // vrati se na detalje obroka
    this.router.navigate(['/meal-details', mealId], {
      queryParams: { mealId, date },
    });
  }

  private async mockFetchProduct(barcode: string) {
    // DEV: lažni podatci da odmah testiraš
    return {
      name: `Product ${barcode}`,
      calories: 210,
      proteins: 8,
      carbs: 27,
      fats: 7,
      unit: 'g' ,
      default_quantity: 100,
    };
  }
}

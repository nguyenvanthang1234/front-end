import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { OrderService } from '../../../services/order.service';
import { ApiResponse } from '../../../responses/api.response';
import { OrderResponse } from '../../../responses/order/order.response';
import { HttpErrorResponse } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-order-admin',
  templateUrl: './order.admin.component.html',
  styleUrls: ['./order.admin.component.scss'],
  standalone: true,
  imports: [   
    CommonModule,
    FormsModule,
  ]
})
export class OrderAdminComponent implements OnInit {
  orders: OrderResponse[] = [];
  currentPage: number = 0;
  itemsPerPage: number = 12;
  totalPages: number = 0;
  keyword: string = "";
  visiblePages: number[] = [];
  localStorage?: Storage;

  constructor(
    private orderService: OrderService,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.localStorage = document.defaultView?.localStorage;
  }

  ngOnInit(): void {
    this.currentPage = Number(this.localStorage?.getItem('currentOrderAdminPage')) || 0; 
    this.getAllOrders();
  }

  searchOrders() {
    this.currentPage = 0;
    this.getAllOrders();
  }

  getAllOrders() {
    this.orderService.getAllOrders(this.keyword, this.currentPage, this.itemsPerPage).subscribe({
      next: (apiResponse: ApiResponse) => {
        console.log('Danh sách đơn hàng:', apiResponse.data);
        this.orders = apiResponse.data;
        this.totalPages = apiResponse.data.totalPages;
        this.visiblePages = this.generateVisiblePageArray(this.currentPage, this.totalPages);
      },
      error: (error: HttpErrorResponse) => {
        console.error(error?.error?.message ?? '');
      }
    });
  }

  onPageChange(page: number) {
    this.currentPage = Math.max(0, page);
    this.localStorage?.setItem('currentOrderAdminPage', String(this.currentPage));         
    this.getAllOrders();
  }

  generateVisiblePageArray(currentPage: number, totalPages: number): number[] {
    const maxVisiblePages = 5;
    const halfVisiblePages = Math.floor(maxVisiblePages / 2);

    if (totalPages <= 0 || currentPage < 0 || currentPage >= totalPages) {
      console.error('Invalid input for page array generation:', { currentPage, totalPages });
      return [];
    }

    let startPage = Math.max(currentPage - halfVisiblePages, 0);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 0);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
  }

  deleteOrder(id: number) {
    const confirmation = window.confirm('Are you sure you want to delete this order?');
    if (confirmation) {
      this.orderService.deleteOrder(id).subscribe({
        next: (response: ApiResponse) => {
          location.reload();
        },
        error: (error: HttpErrorResponse) => {
          console.error(error?.error?.message ?? '');
        }
      });
    }
  }

  viewDetails(order: OrderResponse) {
    this.router.navigate(['/admin/orders', order.id]);
  }
}

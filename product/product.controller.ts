import { Controller, Get } from "@nestjs/common";
import { ProductService } from "src/product/product.service";
@Controller("product")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get("create")
  async create() {
    return await this.productService.createProduct();
  }
}

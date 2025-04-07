import { Controller, Get } from "@nestjs/common";

@Controller("git")
export class ProductController {
  constructor() {}

  @Get("product")
  async loadProduct() {
    return "Das hat funktioniert";
  }
}

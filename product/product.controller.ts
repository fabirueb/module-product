import { Controller, Get } from "@nestjs/common";
import { GitService } from "../git/git.service";

@Controller("git")
export class ProductController {
  constructor(private readonly gitService: GitService) {}

  @Get("product")
  async loadProduct() {
    return "Das hat funktioniert";
  }
}

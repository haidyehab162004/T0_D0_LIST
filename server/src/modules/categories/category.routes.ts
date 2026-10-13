import { Router } from "express";

import { requireAuth } from "../../middleware/require-auth.middleware";
import { validateRequest } from "../../middleware/validate.middleware";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "./category.controller";
import {
  categoryIdValidation,
  createCategoryValidation,
  updateCategoryValidation,
} from "./category.validation";

export const categoryRouter = Router();

categoryRouter.use(requireAuth);

categoryRouter.get("/", listCategories);
categoryRouter.post("/", validateRequest(createCategoryValidation), createCategory);
categoryRouter.patch(
  "/:categoryId",
  validateRequest(updateCategoryValidation),
  updateCategory,
);
categoryRouter.delete(
  "/:categoryId",
  validateRequest(categoryIdValidation),
  deleteCategory,
);

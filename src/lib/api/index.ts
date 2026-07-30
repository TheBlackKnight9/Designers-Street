/**
 * Client-safe data façade.
 * UI / contexts should prefer these helpers over importing mock-data directly
 * when migrating — default still returns the same mock datasets.
 */
export {
  isRemoteApiEnabled,
  listProducts,
  getProduct,
  listProductsByDesigner,
  listProductsByCategory,
  listDesigners,
  getDesigner,
  getDesignerByHandleApi,
  listFeed,
  listStories,
  listCategories,
} from "./catalog";

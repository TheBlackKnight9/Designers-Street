/**
 * Client-safe data façade.
 * UI / contexts should prefer these helpers over importing mock-data directly
 * when migrating — default still returns the same mock datasets.
 */
export {
  isRemoteApiEnabled,
  listProducts,
  listProductCards,
  getProduct,
  getProductDetail,
  listProductsByDesigner,
  listProductsByCategory,
  listDesigners,
  getDesigner,
  getDesignerByHandleApi,
  listFeed,
  listStories,
  listCategories,
  productCardToUiProduct,
  productDetailToUiProduct,
} from "./catalog";

export {
  createMediaUploadSignature,
  registerMedia,
  getMedia,
  deleteMedia,
  uploadMediaFile,
} from "./media";

export {
  fetchDashboardMe,
  listDashboardProducts,
  getDashboardProduct,
  createDashboardProduct,
  updateDashboardProduct,
  deleteDashboardProduct,
  setDashboardProductStatus,
  reorderDashboardMedia,
  registerDashboardMedia,
  deleteDashboardMedia,
  signDashboardUpload,
  updateDashboardProfile,
} from "./dashboard";

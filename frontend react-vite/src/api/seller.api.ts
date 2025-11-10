// Vị trí: src/api/seller.api.ts
import api from './api';
import { ISellerRequest, ISellerProfile, IProductRequest } from '../types/seller';
import { IPage, IProductCardResponse } from '../types/seller';

/**
 * [LUỒNG 1] "Xin" làm Seller
 */
export const applyForSeller = (request: ISellerRequest) => {
  return api.post<ISellerProfile>('/seller/apply', request);
};

/**
 * [LUỒNG 2.1] Lấy hồ sơ Seller của chính mình
 */
export const getMySellerProfile = () => {
  return api.get<ISellerProfile>('seller/me');
};

/**
 * [LUỒNG 2.2] Lấy danh sách sản phẩm theo sellerId
 * Backend yêu cầu: @ModelAttribute ProductFilterRequest + @RequestParam Long sellerId
 */

/**
 * [LUỒNG 2.3] Thêm sản phẩm
 */
export const addProduct = (request: IProductRequest, sellerId: number) => {
  return api.post('/seller/add-product', request, {
    params: { sellerId }
  });
};

/**
 * [LUỒNG 2.4] Cập nhật sản phẩm
 */
export const updateProduct = (productId: number, request: IProductRequest) => {
  return api.patch('seller/update-product', request, {
    params: { id: productId }
  });
};

/**
 * [LUỒNG 2.5] Hồ sơ Business (alias)
 */
export const getMyBusinessProfile = () => {
  return api.get<ISellerProfile>('seller/me');
};

export const getSellerProducts = (page: number = 0, size: number = 10) => {
  return api.get<IPage<IProductCardResponse>>('/seller/products', {
    params: {
      // sellerId, (ĐÃ XÓA)
      page,
      size,
      sort: 'createdAt,desc',
      // sellerView: true (Backend tự set)
    }
  });
};
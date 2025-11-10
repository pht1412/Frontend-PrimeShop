package com.primeshop.product;

import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;

public class ProductSpecification {

    public static Specification<Product> filter(ProductFilterRequest request) {

        return (root, query, criteriaBuilder) -> {

            List<Predicate> predicates = new ArrayList<>();
            // ▼▼▼ BẮT ĐẦU SỬA CHỖ NÀY ▼▼▼
            // Logic "VÀNG": Phân quyền xem

            if (request.getSellerView()) {

                // 1. NẾU LÀ SELLER XEM (Shop "phat" ID 53)

                // -> "Bắt buộc" phải đúng sellerId

                predicates.add(criteriaBuilder.equal(root.get("seller").get("id"), request.getSellerId()));

                // (Seller được xem cả hàng PENDING, DISABLED nên không add "active = true")

            } else {

                // 2. NẾU LÀ CUSTOMER XEM

                // -> Chỉ xem hàng đang "active"

                predicates.add(criteriaBuilder.isTrue(root.get("active")));

            }

            

            // ▲▲▲ KẾT THÚC SỬA CHỖ NÀY ▲▲▲



            // Các bộ lọc CÔNG KHAI (dùng chung cho cả Seller và Customer)

            if (request.getSearch() != null) {

                predicates.add(criteriaBuilder.like(root.get("name"), "%" + request.getSearch() + "%"));

            }

            if (request.getCategory() != null) {

                predicates.add(criteriaBuilder.equal(root.get("category").get("slug"), request.getCategory()));

            }

            if (request.getBrand() != null) {

                predicates.add(criteriaBuilder.equal(root.get("brand"), request.getBrand()));

            }

            if (request.getMinPrice() != null) {

                predicates.add(

                    criteriaBuilder.greaterThanOrEqualTo(root.get("price"), request.getMinPrice())

                );

            }           

            if (request.getMaxPrice() != null) {

                predicates.add(

                    criteriaBuilder.lessThanOrEqualTo(root.get("price"), request.getMaxPrice())

                );

            }

            

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));

        };

    }

}

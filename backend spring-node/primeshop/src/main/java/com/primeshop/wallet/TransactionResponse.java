package com.primeshop.wallet;

import java.util.Date;
import lombok.Data; // <-- Thêm import này
import lombok.AllArgsConstructor; // <-- Thêm import này
import lombok.NoArgsConstructor; // <-- Thêm import này

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TransactionResponse {
    private Long id;
    private Double amount;
    private String type;
    private String description;
    private Date createdAt;

}
package com.healthcare.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;

/** Pagination envelope matching the frontend's expected shape. */
@Data
@AllArgsConstructor
public class PageResponse<T> {
    private List<T> content;
    private long total;
    private int page;
    private int size;
    private int totalPages;

    public static <E, T> PageResponse<T> from(Page<E> page, Function<E, T> mapper) {
        return new PageResponse<>(
                page.getContent().stream().map(mapper).toList(),
                page.getTotalElements(),
                page.getNumber() + 1,
                page.getSize(),
                Math.max(page.getTotalPages(), 1)
        );
    }
}

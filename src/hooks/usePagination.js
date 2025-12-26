import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Custom hook for implementing pagination with lazy loading support
 * @param {Array} data - The full dataset to paginate
 * @param {Object} options - Configuration options
 * @param {number} options.pageSize - Number of items per page (default: 25)
 * @param {boolean} options.infiniteScroll - Enable infinite scroll mode (default: false)
 * @param {Function} options.onPageChange - Callback when page changes
 * @returns {Object} Pagination state and controls
 */
export const usePagination = (data = [], options = {}) => {
  const {
    pageSize = 25,
    infiniteScroll = false,
    onPageChange = null
  } = options;

  const [currentPage, setCurrentPage] = useState(1);
  const [loadedPages, setLoadedPages] = useState([1]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil((data?.length || 0) / pageSize);
  }, [data?.length, pageSize]);

  // Calculate total items
  const totalItems = useMemo(() => {
    return data?.length || 0;
  }, [data?.length]);

  // Get paginated data for current page (or all loaded pages in infinite scroll mode)
  const paginatedData = useMemo(() => {
    if (infiniteScroll) {
      // In infinite scroll mode, return all data up to current page
      const endIndex = currentPage * pageSize;
      return data?.slice(0, endIndex) || [];
    } else {
      // In regular pagination, return only current page
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      return data?.slice(startIndex, endIndex) || [];
    }
  }, [data, currentPage, pageSize, infiniteScroll]);

  // Calculate pagination info
  const pageInfo = useMemo(() => {
    const startIndex = infiniteScroll ? 0 : (currentPage - 1) * pageSize;
    const endIndex = infiniteScroll ? paginatedData?.length : Math.min(currentPage * pageSize, totalItems);
    
    return {
      currentPage,
      totalPages,
      pageSize,
      totalItems,
      startIndex: startIndex + 1,
      endIndex,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      isFirstPage: currentPage === 1,
      isLastPage: currentPage === totalPages
    };
  }, [currentPage, totalPages, pageSize, totalItems, infiniteScroll, paginatedData?.length]);

  // Go to specific page
  const goToPage = useCallback((page) => {
    const targetPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(targetPage);
    
    if (!loadedPages?.includes(targetPage)) {
      setLoadedPages(prev => [...prev, targetPage]);
    }
    
    if (onPageChange) {
      onPageChange(targetPage);
    }
  }, [totalPages, loadedPages, onPageChange]);

  // Go to next page
  const nextPage = useCallback(() => {
    if (pageInfo?.hasNextPage) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, pageInfo?.hasNextPage, goToPage]);

  // Go to previous page
  const previousPage = useCallback(() => {
    if (pageInfo?.hasPreviousPage) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, pageInfo?.hasPreviousPage, goToPage]);

  // Go to first page
  const firstPage = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  // Go to last page
  const lastPage = useCallback(() => {
    goToPage(totalPages);
  }, [totalPages, goToPage]);

  // Load more items (for infinite scroll)
  const loadMore = useCallback(() => {
    if (infiniteScroll && pageInfo?.hasNextPage) {
      nextPage();
    }
  }, [infiniteScroll, pageInfo?.hasNextPage, nextPage]);

  // Reset pagination when data changes
  useEffect(() => {
    setCurrentPage(1);
    setLoadedPages([1]);
  }, [data?.length]);

  // Generate page numbers for pagination UI
  const getPageNumbers = useCallback((maxVisible = 5) => {
    const pages = [];
    const halfVisible = Math.floor(maxVisible / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);

    // Adjust if we're near the beginning or end
    if (currentPage <= halfVisible) {
      endPage = Math.min(maxVisible, totalPages);
    } else if (currentPage + halfVisible >= totalPages) {
      startPage = Math.max(1, totalPages - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages?.push(i);
    }

    return pages;
  }, [currentPage, totalPages]);

  return {
    // Data
    paginatedData,
    
    // Page info
    pageInfo,
    
    // Navigation functions
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    loadMore,
    
    // Utility functions
    getPageNumbers,
    
    // State
    currentPage,
    totalPages,
    totalItems
  };
};

export default usePagination;
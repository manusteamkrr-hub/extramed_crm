import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';


/**
 * Pagination component for displaying page navigation
 * @param {Object} props
 * @param {Object} props.pageInfo - Pagination information from usePagination hook
 * @param {Function} props.onPageChange - Callback when page changes
 * @param {Function} props.onFirstPage - Callback to go to first page
 * @param {Function} props.onLastPage - Callback to go to last page
 * @param {Function} props.onNextPage - Callback to go to next page
 * @param {Function} props.onPreviousPage - Callback to go to previous page
 * @param {Array} props.pageNumbers - Array of page numbers to display
 * @param {boolean} props.showFirstLast - Show first/last page buttons (default: true)
 * @param {string} props.className - Additional CSS classes
 */
export const Pagination = ({
  pageInfo,
  onPageChange,
  onFirstPage,
  onLastPage,
  onNextPage,
  onPreviousPage,
  pageNumbers = [],
  showFirstLast = true,
  className = ''
}) => {
  if (!pageInfo || pageInfo?.totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 ${className}`}>
      {/* Mobile pagination */}
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={onPreviousPage}
          disabled={!pageInfo?.hasPreviousPage}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Назад
        </button>
        <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700">
          Страница {pageInfo?.currentPage} из {pageInfo?.totalPages}
        </span>
        <button
          onClick={onNextPage}
          disabled={!pageInfo?.hasNextPage}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Вперёд
        </button>
      </div>
      {/* Desktop pagination */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        {/* Results info */}
        <div>
          <p className="text-sm text-gray-700">
            Показано{' '}
            <span className="font-medium">{pageInfo?.startIndex}</span>
            {' '}-{' '}
            <span className="font-medium">{pageInfo?.endIndex}</span>
            {' '}из{' '}
            <span className="font-medium">{pageInfo?.totalItems}</span>
            {' '}результатов
          </p>
        </div>

        {/* Page controls */}
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            {/* First page button */}
            {showFirstLast && (
              <button
                onClick={onFirstPage}
                disabled={pageInfo?.isFirstPage}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Первая страница"
              >
                <ChevronsLeft className="h-5 w-5" />
              </button>
            )}

            {/* Previous button */}
            <button
              onClick={onPreviousPage}
              disabled={!pageInfo?.hasPreviousPage}
              className={`relative inline-flex items-center ${showFirstLast ? '' : 'rounded-l-md'} px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label="Предыдущая страница"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Page numbers */}
            {pageNumbers?.length > 0 && pageNumbers?.map((pageNum, index) => {
              const isCurrentPage = pageNum === pageInfo?.currentPage;
              const showEllipsisBefore = index === 0 && pageNum > 1;
              const showEllipsisAfter = index === pageNumbers?.length - 1 && pageNum < pageInfo?.totalPages;

              return (
                <React.Fragment key={pageNum}>
                  {showEllipsisBefore && (
                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">
                      ...
                    </span>
                  )}
                  <button
                    onClick={() => onPageChange(pageNum)}
                    aria-current={isCurrentPage ? 'page' : undefined}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      isCurrentPage
                        ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600' :'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                    }`}
                  >
                    {pageNum}
                  </button>
                  {showEllipsisAfter && (
                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">
                      ...
                    </span>
                  )}
                </React.Fragment>
              );
            })}

            {/* Next button */}
            <button
              onClick={onNextPage}
              disabled={!pageInfo?.hasNextPage}
              className={`relative inline-flex items-center ${showFirstLast ? '' : 'rounded-r-md'} px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label="Следующая страница"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Last page button */}
            {showFirstLast && (
              <button
                onClick={onLastPage}
                disabled={pageInfo?.isLastPage}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Последняя страница"
              >
                <ChevronsRight className="h-5 w-5" />
              </button>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
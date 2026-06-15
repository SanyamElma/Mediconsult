import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { FiSearch, FiSliders, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import DoctorCard from '../../components/cards/DoctorCard';
import FilterSidebar from '../../components/common/FilterSidebar';
import { CardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Modal from '../../components/modals/Modal';
import { doctorService } from '../../services/api';

const SORTS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'experience', label: 'Most Experienced' },
  { value: 'charges_low', label: 'Fees: Low to High' },
  { value: 'charges_high', label: 'Fees: High to Low' },
  { value: 'popular', label: 'Most Booked' },
];

export default function DoctorListing() {
  const [filters, setFilters] = useState({ page: 1, size: 9, sort: 'relevance' });
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['doctors', filters],
    queryFn: () => doctorService.list(filters),
    placeholderData: keepPreviousData,
  });

  const submitSearch = (e) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, search, page: 1 }));
  };

  const activeFilterCount =
    (filters.specializations?.length || 0) +
    (filters.experience ? 1 : 0) +
    (filters.charges ? 1 : 0) +
    (filters.availability ? 1 : 0) +
    (filters.minRating ? 1 : 0);

  return (
    <div>
      <PageHeader title="Find Doctors" subtitle={`${data?.total ?? 0} specialists ready to consult`} />

      {/* Search + sort bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <form onSubmit={submitSearch} className="relative flex-1">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by doctor name or speciality…"
            className="input pl-10"
          />
        </form>
        <select
          value={filters.sort}
          onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value, page: 1 }))}
          className="input sm:w-56"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <Button variant="outline" className="lg:hidden" onClick={() => setShowFilters(true)}>
          <FiSliders /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <FilterSidebar filters={filters} setFilters={setFilters} className="hidden lg:block" />

        <div>
          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : data?.content.length === 0 ? (
            <EmptyState title="No doctors match your filters" message="Try widening your search or clearing some filters." />
          ) : (
            <div className={isFetching ? 'opacity-60 transition' : 'transition'}>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {data.content.map((d, i) => <DoctorCard key={d.id} doctor={d} delay={i * 0.04} compact />)}
              </div>

              {/* Pagination */}
              {data.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filters.page <= 1}
                    onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                  >
                    <FiChevronLeft /> Prev
                  </Button>
                  {Array.from({ length: data.totalPages }).slice(0, 7).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setFilters((f) => ({ ...f, page: i + 1 }))}
                      className={`h-9 w-9 rounded-lg text-sm font-semibold transition ${
                        filters.page === i + 1 ? 'bg-brand-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filters.page >= data.totalPages}
                    onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                  >
                    Next <FiChevronRight />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter modal */}
      <Modal open={showFilters} onClose={() => setShowFilters(false)} title="Filters" size="sm">
        <FilterSidebar filters={filters} setFilters={setFilters} className="!border-0 !bg-transparent !p-0 !shadow-none" />
        <Button className="mt-4 w-full" onClick={() => setShowFilters(false)}>Show {data?.total ?? 0} results</Button>
      </Modal>
    </div>
  );
}

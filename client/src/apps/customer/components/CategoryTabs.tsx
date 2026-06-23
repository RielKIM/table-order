/** 카테고리 탭 (US-C03) */
interface CategoryTabsProps {
  categories: string[];
  selected?: string;
  onSelect: (category: string) => void;
}

function CategoryTabs({ categories, selected, onSelect }: CategoryTabsProps) {
  if (categories.length === 0) return null;

  return (
    <div
      data-testid="category-tabs"
      className="flex gap-2 overflow-x-auto border-b border-gray-200 bg-white px-4 py-2"
      role="tablist"
    >
      {categories.map((category) => {
        const isActive = category === selected;
        return (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={isActive}
            data-testid={`category-tab-${category}`}
            className={
              isActive
                ? 'min-h-[44px] whitespace-nowrap rounded-full bg-blue-600 px-4 text-sm font-medium text-white'
                : 'min-h-[44px] whitespace-nowrap rounded-full bg-gray-100 px-4 text-sm font-medium text-gray-700 hover:bg-gray-200'
            }
            onClick={() => onSelect(category)}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}

export default CategoryTabs;

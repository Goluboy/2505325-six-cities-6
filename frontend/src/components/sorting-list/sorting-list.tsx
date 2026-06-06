import type { SortName } from '../../types/types';

import { useState } from 'react';

import { Sorting } from '../../const';


type SortingListProps = {
  onChange: (name: SortName) => void;
  activeSorting: SortName;
};

const SortingList = ({
  onChange,
  activeSorting,
}: SortingListProps): JSX.Element => {
  const [isOpened, setIsOpened] = useState<boolean>(false);

  const handleToggleButtonClick = () => {
    setIsOpened((prevIsOpened) => !prevIsOpened);
  };

  const handleSortItemClick = (name: SortName) => {
    setIsOpened(false);
    onChange(name);
  };

  const sortingEntries = Object.entries(Sorting) as [SortName, string][];

  return (
    <form className="places__sorting" action="#" method="get">
      <span className="places__sorting-caption">Sort by</span>
      <span
        className="places__sorting-type"
        tabIndex={0}
        onClick={handleToggleButtonClick}
      >
        {Sorting[activeSorting]}
        <svg className="places__sorting-arrow" width="7" height="4">
          <use xlinkHref="#icon-arrow-select"></use>
        </svg>
      </span>
      {isOpened && (
        <ul className="places__options places__options--custom places__options--opened">
          {sortingEntries.map(([name, title], index) => (
            <li
              key={`${name}-${index}`}  // ✅ Гарантируем, что key всегда строка
              className={`places__option${
                name === activeSorting ? ' places__option--active' : ''
              }`}
              onClick={() => handleSortItemClick(name)}
              tabIndex={0}
            >
              {title}
            </li>
          ))}
        </ul>
      )}
    </form>
  );
};

export default SortingList;

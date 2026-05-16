import { useState } from 'react';
import styled from 'styled-components';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { GetJobPostsParams, TimeTag, WageType } from 'entities/jobPost/model/types/jobPost.type';
import type { CertificateType } from 'shared/types/certificate';
import { CERTIFICATE_LABEL } from 'shared/types/certificate';
import Button from 'shared/ui/Button/Button';
import Badge from 'shared/ui/Badge/Badge';

const SORT_OPTIONS = [
  { label: '추천순', value: 'RECOMMENDED' },
  { label: '근무일순', value: 'WORK_DATE' },
  { label: '급여순', value: 'WAGE' },
  { label: '마감임박순', value: 'DEADLINE' },
] as const;

const TIME_TAG_OPTIONS: { label: string; value: TimeTag }[] = [
  { label: '오전', value: 'MORNING' },
  { label: '오후', value: 'AFTERNOON' },
  { label: '저녁', value: 'EVENING' },
  { label: '새벽', value: 'DAWN' },
];

const WAGE_TYPE_OPTIONS: { label: string; value: WageType }[] = [
  { label: '시급', value: 'HOURLY' },
  { label: '일급', value: 'DAILY' },
  { label: '월급', value: 'MONTHLY' },
];

const CERT_OPTIONS = (Object.keys(CERTIFICATE_LABEL) as CertificateType[]).map((key) => ({
  label: CERTIFICATE_LABEL[key],
  value: key,
}));

interface Props {
  activeFilters: GetJobPostsParams;
  onFilterChange: (params: Partial<GetJobPostsParams>) => void;
}

export const JobPostFilterBar = ({ activeFilters, onFilterChange }: Props) => {
  const [keyword, setKeyword] = useState(activeFilters.keyword || '');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 필터 패널 내부 로컬 state (검색 버튼 누를 때만 반영)
  const [draftLocation, setDraftLocation] = useState(activeFilters.location || '');
  const [draftMinWage, setDraftMinWage] = useState(activeFilters.minWage?.toString() || '');
  const [draftWageType, setDraftWageType] = useState<WageType | undefined>(activeFilters.wageType);
  const [draftTimeTags, setDraftTimeTags] = useState<TimeTag[]>(activeFilters.timeTags || []);
  const [draftCerts, setDraftCerts] = useState<CertificateType[]>(activeFilters.certRequirements || []);

  // 검색 버튼: 키워드 + 필터 패널 옵션 한 번에 반영
  const handleSearch = () => {
    onFilterChange({
      keyword: keyword || undefined,
      location: draftLocation || undefined,
      minWage: draftMinWage ? Number(draftMinWage) : undefined,
      wageType: draftWageType,
      timeTags: draftTimeTags.length > 0 ? draftTimeTags : undefined,
      certRequirements: draftCerts.length > 0 ? draftCerts : undefined,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  // 정렬은 즉시 반영 (UX 관례)
  const handleSortChange = (sort: GetJobPostsParams['sortType']) => {
    onFilterChange({ sortType: sort });
  };

  const toggleDraftTimeTag = (tag: TimeTag) => {
    setDraftTimeTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleDraftCert = (cert: CertificateType) => {
    setDraftCerts((prev) =>
      prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert]
    );
  };

  const toggleDraftWageType = (type: WageType) => {
    setDraftWageType((prev) => (prev === type ? undefined : type));
  };

  const activeFilterCount = [
    draftTimeTags.length > 0,
    draftCerts.length > 0,
    draftLocation,
    draftMinWage,
    draftWageType,
  ].filter(Boolean).length;

  return (
    <S.Wrapper>
      {/* 검색바 */}
      <S.SearchRow>
        <S.SearchInputWrapper>
          <Search size={18} />
          <S.SearchInput
            type="text"
            placeholder="공고 검색 (직종, 회사명, 지역...)"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {keyword && (
            <S.ClearButton onClick={() => { setKeyword(''); onFilterChange({ keyword: undefined }); }}>
              <X size={16} />
            </S.ClearButton>
          )}
        </S.SearchInputWrapper>

        <Button scheme="primary" buttonSize="small" onClick={handleSearch}>
          검색
        </Button>

        <S.FilterToggle onClick={() => setIsFilterOpen(!isFilterOpen)} $active={isFilterOpen || activeFilterCount > 0}>
          <SlidersHorizontal size={18} />
          필터
          {activeFilterCount > 0 && <Badge scheme="primary">{activeFilterCount}</Badge>}
        </S.FilterToggle>
      </S.SearchRow>

      {/* 정렬 (즉시 반영) */}
      <S.SortRow>
        {SORT_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            type="button"
            scheme={activeFilters.sortType === opt.value ? 'optionActive' : 'option'}
            buttonSize="xsmall"
            fontSize="xsmall"
            borderRadius="round"
            onClick={() => handleSortChange(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </S.SortRow>

      {/* 필터 패널 (로컬 state, 검색 버튼으로 반영) */}
      {isFilterOpen && (
        <S.FilterPanel>
          {/* 지역 */}
          <S.FilterSection>
            <S.FilterLabel>지역</S.FilterLabel>
            <S.FilterInput
              type="text"
              placeholder="예: 서울, 강남"
              value={draftLocation}
              onChange={(e) => setDraftLocation(e.target.value)}
            />
          </S.FilterSection>

          {/* 최소 급여 + 급여 유형 */}
          <S.FilterSection>
            <S.FilterLabel>최소 급여</S.FilterLabel>
            <S.WageRow>
              <S.FilterInput
                type="number"
                placeholder="예: 100000"
                value={draftMinWage}
                onChange={(e) => setDraftMinWage(e.target.value)}
              />
              <S.WageTypeGroup>
                {WAGE_TYPE_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    scheme={draftWageType === opt.value ? 'optionActive' : 'option'}
                    buttonSize="xsmall"
                    fontSize="xsmall"
                    borderRadius="round"
                    onClick={() => toggleDraftWageType(opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </S.WageTypeGroup>
            </S.WageRow>
          </S.FilterSection>

          {/* 시간대 */}
          <S.FilterSection>
            <S.FilterLabel>시간대</S.FilterLabel>
            <S.TagGroup>
              {TIME_TAG_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  scheme={draftTimeTags.includes(opt.value) ? 'optionActive' : 'option'}
                  buttonSize="xsmall"
                  fontSize="xsmall"
                  borderRadius="round"
                  onClick={() => toggleDraftTimeTag(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </S.TagGroup>
          </S.FilterSection>

          {/* 필수 자격 */}
          <S.FilterSection>
            <S.FilterLabel>필수 자격</S.FilterLabel>
            <S.TagGroup>
              {CERT_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  scheme={draftCerts.includes(opt.value) ? 'optionActive' : 'option'}
                  buttonSize="xsmall"
                  fontSize="xsmall"
                  borderRadius="round"
                  onClick={() => toggleDraftCert(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </S.TagGroup>
          </S.FilterSection>

          {/* 필터 적용 버튼 */}
          <S.FilterActions>
            <Button scheme="primary" buttonSize="small" onClick={handleSearch}>
              필터 적용
            </Button>
          </S.FilterActions>
        </S.FilterPanel>
      )}
    </S.Wrapper>
  );
};

const S = {
  Wrapper: styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px 20px 0;
  `,
  SearchRow: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
  `,
  SearchInputWrapper: styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    background: ${({ theme }) => theme.color.white};

    &:focus-within {
      border-color: ${({ theme }) => theme.color.primary};
      box-shadow: 0 0 0 1px ${({ theme }) => theme.color.primary};
    }

    svg {
      color: ${({ theme }) => theme.color.subText};
      flex-shrink: 0;
    }
  `,
  SearchInput: styled.input`
    flex: 1;
    border: none;
    outline: none;
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.text};
    background: transparent;

    &::placeholder {
      color: ${({ theme }) => theme.color.subText};
    }
  `,
  ClearButton: styled.button`
    display: flex;
    align-items: center;
    background: none;
    border: none;
    cursor: pointer;
    color: ${({ theme }) => theme.color.subText};

    &:hover {
      color: ${({ theme }) => theme.color.text};
    }
  `,
  FilterToggle: styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    border: 1px solid ${({ theme, $active }) => $active ? theme.color.primary : theme.color.border};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    background: ${({ theme, $active }) => $active ? theme.color.secondary : theme.color.white};
    color: ${({ theme, $active }) => $active ? theme.color.primary : theme.color.text};
    font-size: ${({ theme }) => theme.fontSize.small};
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.15s ease;

    &:hover {
      border-color: ${({ theme }) => theme.color.primary};
      color: ${({ theme }) => theme.color.primary};
    }
  `,
  SortRow: styled.div`
    display: flex;
    gap: 6px;
  `,
  FilterPanel: styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    padding: 20px;
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    background: ${({ theme }) => theme.color.white};
    box-shadow: ${({ theme }) => theme.shadow.default};

    @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
      grid-template-columns: 1fr;
    }
  `,
  FilterSection: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,
  FilterLabel: styled.span`
    font-size: ${({ theme }) => theme.fontSize.small};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    color: ${({ theme }) => theme.color.text};
  `,
  FilterInput: styled.input`
    padding: 8px 12px;
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: ${({ theme }) => theme.borderRadius.small};
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.text};
    outline: none;

    &:focus {
      border-color: ${({ theme }) => theme.color.primary};
    }

    &::placeholder {
      color: ${({ theme }) => theme.color.subText};
    }
  `,
  TagGroup: styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  `,
  WageRow: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
  `,
  WageTypeGroup: styled.div`
    display: flex;
    gap: 4px;
    flex-shrink: 0;
  `,
  FilterActions: styled.div`
    grid-column: 1 / -1;
    display: flex;
    justify-content: flex-end;
    padding-top: 8px;
    border-top: 1px solid ${({ theme }) => theme.color.border};
  `,
};

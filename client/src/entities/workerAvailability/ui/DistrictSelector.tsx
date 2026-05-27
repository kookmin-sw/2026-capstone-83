import { useState } from 'react';
import { X } from 'lucide-react';
import styled from 'styled-components';
import { DISTRICT_GROUPS } from '../model/constants/districts';

interface Props {
  value: string[];
  onChange: (districts: string[]) => void;
  /** 최소 1개 미선택 시 오류 메시지 표시 */
  showError?: boolean;
}

/**
 * 희망 근무 지역 멀티 선택 컴포넌트.
 * 도시 탭을 누르면 해당 도시의 구/군 칩 목록이 나타나고,
 * 칩을 클릭해 선택·해제한다. 선택된 지역은 하단에 태그로 표시된다.
 */
const DistrictSelector = ({ value, onChange, showError }: Props) => {
  const [activeCity, setActiveCity] = useState<string | null>(null);

  const toggleDistrict = (district: string) => {
    if (value.includes(district)) {
      onChange(value.filter((d) => d !== district));
    } else {
      onChange([...value, district]);
    }
  };

  const removeDistrict = (district: string) => {
    onChange(value.filter((d) => d !== district));
  };

  const activeGroup = DISTRICT_GROUPS.find((g) => g.city === activeCity);

  return (
    <S.Wrapper>
      <S.Label>
        희망 근무 지역 <S.Required>*</S.Required>
      </S.Label>

      {/* 도시 탭 */}
      <S.CityTabs>
        {DISTRICT_GROUPS.map((g) => {
          const hasSelected = g.districts.some((d) => value.includes(d));
          return (
            <S.CityTab
              key={g.city}
              type="button"
              $active={activeCity === g.city}
              $hasSelected={hasSelected}
              onClick={() => setActiveCity(activeCity === g.city ? null : g.city)}
            >
              {g.city}
              {hasSelected && <S.SelectedDot />}
            </S.CityTab>
          );
        })}
      </S.CityTabs>

      {/* 구/군 칩 목록 */}
      {activeGroup && (
        <S.ChipGrid>
          {activeGroup.districts.map((d) => {
            const label = d.replace(`${activeGroup.city} `, ''); // "서울 강남구" → "강남구"
            return (
              <S.Chip
                key={d}
                type="button"
                $selected={value.includes(d)}
                onClick={() => toggleDistrict(d)}
              >
                {label}
              </S.Chip>
            );
          })}
        </S.ChipGrid>
      )}

      {/* 선택된 지역 태그 */}
      {value.length > 0 ? (
        <S.SelectedTags>
          {value.map((d) => (
            <S.Tag key={d}>
              {d}
              <button type="button" onClick={() => removeDistrict(d)} aria-label={`${d} 제거`}>
                <X size={11} strokeWidth={2.5} />
              </button>
            </S.Tag>
          ))}
        </S.SelectedTags>
      ) : (
        showError && (
          <S.ErrorText>희망 근무 지역을 최소 1개 이상 선택해주세요.</S.ErrorText>
        )
      )}
    </S.Wrapper>
  );
};

export default DistrictSelector;

const S = {
  Wrapper: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,

  Label: styled.span`
    font-size: ${({ theme }) => theme.fontSize.small};
    font-weight: ${({ theme }) => theme.fontWeight.medium};
    color: ${({ theme }) => theme.color.text};
  `,

  Required: styled.span`
    color: ${({ theme }) => theme.color.required};
    margin-left: 2px;
  `,

  CityTabs: styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  `,

  CityTab: styled.button<{ $active: boolean; $hasSelected: boolean }>`
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 12px;
    border-radius: ${({ theme }) => theme.borderRadius.round};
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    font-weight: ${({ theme }) => theme.fontWeight.medium};
    cursor: pointer;
    transition: background 0.15s, color 0.15s, border-color 0.15s;

    ${({ $active, $hasSelected, theme }) =>
      $active
        ? `
          background: ${theme.color.primary};
          color: ${theme.color.white};
          border: 1px solid ${theme.color.primary};
        `
        : $hasSelected
          ? `
          background: ${theme.color.secondary};
          color: ${theme.color.tertiary};
          border: 1px solid ${theme.color.primary};
        `
          : `
          background: ${theme.color.white};
          color: ${theme.color.subText};
          border: 1px solid ${theme.color.border};
          &:hover {
            border-color: ${theme.color.primary};
            color: ${theme.color.primary};
          }
        `}
  `,

  SelectedDot: styled.span`
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
  `,

  ChipGrid: styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 10px;
    background: ${({ theme }) => theme.color.background};
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: 8px;
  `,

  Chip: styled.button<{ $selected: boolean }>`
    padding: 4px 10px;
    border-radius: ${({ theme }) => theme.borderRadius.round};
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    cursor: pointer;
    transition: background 0.15s, color 0.15s, border-color 0.15s;

    ${({ $selected, theme }) =>
      $selected
        ? `
          background: ${theme.color.primary};
          color: ${theme.color.white};
          border: 1px solid ${theme.color.primary};
          font-weight: ${theme.fontWeight.medium};
        `
        : `
          background: ${theme.color.white};
          color: ${theme.color.text};
          border: 1px solid ${theme.color.border};
          &:hover {
            border-color: ${theme.color.primary};
            color: ${theme.color.primary};
          }
        `}
  `,

  SelectedTags: styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    min-height: 28px;
  `,

  Tag: styled.span`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px 3px 10px;
    background: ${({ theme }) => theme.color.secondary};
    color: ${({ theme }) => theme.color.tertiary};
    border: 1px solid ${({ theme }) => theme.color.primary};
    border-radius: ${({ theme }) => theme.borderRadius.round};
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    font-weight: ${({ theme }) => theme.fontWeight.medium};

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      color: ${({ theme }) => theme.color.tertiary};
      opacity: 0.7;
      &:hover { opacity: 1; }
    }
  `,

  ErrorText: styled.p`
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    color: ${({ theme }) => theme.color.error};
    margin: 0;
  `,
};

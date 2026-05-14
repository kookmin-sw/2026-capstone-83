import { useState } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import type { Career, CareerRequest } from '../../model/types/resume.type';
import { useCreateCareer, useDeleteCareer, useUpdateCareer } from '../../model/hooks/useResume';
import { InputText } from 'shared/ui/Input/InputText';
import Button from 'shared/ui/Button/Button';
import InputHeader from 'shared/ui/Input/InputHeader';

interface Props {
  careers: Career[];
}

export const ResumeCareerFields = ({ careers }: Props) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { mutate: createCareer } = useCreateCareer();
  const { mutate: updateCareer } = useUpdateCareer();
  const { mutate: deleteCareer } = useDeleteCareer();

  const {
    register: registerNew,
    handleSubmit: handleSubmitNew,
    reset: resetNew,
  } = useForm<CareerRequest>();

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    setValue: setEditValue,
  } = useForm<Career>();

  const handleCreate = (data: CareerRequest) => {
    createCareer(data, {
      onSuccess: () => {
        resetNew();
        setIsAdding(false);
      },
    });
  };

  const handleUpdate = (data: Career) => {
    updateCareer(data, {
      onSuccess: () => {
        setEditingId(null);
        resetEdit();
      },
    });
  };

  const startEdit = (career: Career) => {
    setEditingId(career.id);
    setEditValue('id', career.id);
    setEditValue('jobTitle', career.jobTitle);
    setEditValue('years', career.years);
    setEditValue('months', career.months);
  };

  const formatDuration = (years: number, months: number) => {
    const parts = [];
    if (years > 0) parts.push(`${years}년`);
    if (months > 0) parts.push(`${months}개월`);
    return parts.join(' ') || '0개월';
  };

  const totalMonths = careers.reduce((sum, c) => sum + c.years * 12 + c.months, 0);
  const totalYears = Math.floor(totalMonths / 12);
  const remainMonths = totalMonths % 12;

  return (
    <div>
      <InputHeader title="경력사항" titleSize="medium" />
      <S.TotalCareer>
        총 <strong>{formatDuration(totalYears, remainMonths)}</strong>
      </S.TotalCareer>

      {/* 경력 목록 */}
      <S.CareerList>
        {careers.map((career) => (
          <S.CareerItem key={career.id}>
            {editingId === career.id ? (
              <S.EditForm as="div">
                <InputText
                  placeholder="담당 업무"
                  {...registerEdit('jobTitle', { required: true })}
                />
                <S.DurationRow>
                  <InputText
                    type="number"
                    placeholder="년"
                    {...registerEdit('years', { valueAsNumber: true })}
                  />
                  <span>년</span>
                  <InputText
                    type="number"
                    placeholder="개월"
                    {...registerEdit('months', { valueAsNumber: true })}
                  />
                  <span>개월</span>
                </S.DurationRow>
                <S.ButtonRow>
                  <Button type="button" scheme="secondary" buttonSize="xsmall" onClick={() => setEditingId(null)}>
                    취소
                  </Button>
                  <Button type="button" scheme="primary" buttonSize="xsmall" onClick={handleSubmitEdit(handleUpdate)}>
                    저장
                  </Button>
                </S.ButtonRow>
              </S.EditForm>
            ) : (
              <S.CareerDisplay>
                <span className="title">
                  {career.jobTitle} ({formatDuration(career.years, career.months)})
                </span>
                <S.ButtonRow>
                  <Button type="button" scheme="secondary" buttonSize="xsmall" onClick={() => startEdit(career)}>
                    수정
                  </Button>
                  <Button type="button" scheme="secondary" buttonSize="xsmall" onClick={() => deleteCareer(career.id)}>
                    삭제
                  </Button>
                </S.ButtonRow>
              </S.CareerDisplay>
            )}
          </S.CareerItem>
        ))}
      </S.CareerList>

      {/* 경력 추가 */}
      {isAdding ? (
        <S.AddForm as="div">
          <InputText
            label="담당 업무"
            labelSize="xsmall"
            placeholder="ex. 물류 센터 하차"
            {...registerNew('jobTitle', { required: true })}
          />
          <S.DurationRow>
            <span className="label">근무 기간</span>
            <InputText
              type="number"
              placeholder="0"
              style={{ width: '80px' }}
              {...registerNew('years', { valueAsNumber: true })}
            />
            <span>년</span>
            <InputText
              type="number"
              placeholder="0"
              style={{ width: '80px' }}
              {...registerNew('months', { valueAsNumber: true })}
            />
            <span>개월</span>
          </S.DurationRow>
          <S.ButtonRow>
            <Button type="button" scheme="secondary" buttonSize="xsmall" onClick={() => { setIsAdding(false); resetNew(); }}>
              취소
            </Button>
            <Button type="button" scheme="primary" buttonSize="xsmall" onClick={handleSubmitNew(handleCreate)}>
              저장
            </Button>
          </S.ButtonRow>
        </S.AddForm>
      ) : (
        <S.AddButton type="button" onClick={() => setIsAdding(true)}>
          + 경력 추가
        </S.AddButton>
      )}
    </div>
  );
};

const S = {
  TotalCareer: styled.div`
    margin-top: 12px;
    margin-bottom: 16px;
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.subText};
    strong {
      color: ${({ theme }) => theme.color.primary};
      font-weight: ${({ theme }) => theme.fontWeight.semibold};
    }
  `,
  CareerList: styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
  `,
  CareerItem: styled.div`
    padding: 12px 16px;
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
  `,
  CareerDisplay: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    .title {
      font-size: ${({ theme }) => theme.fontSize.small};
    }
  `,
  EditForm: styled.form`
    display: flex;
    flex-direction: column;
    gap: 12px;
  `,
  AddForm: styled.form`
    margin-top: 12px;
    padding: 16px;
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    display: flex;
    flex-direction: column;
    gap: 12px;
  `,
  DurationRow: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: ${({ theme }) => theme.fontSize.small};
    .label {
      font-weight: ${({ theme }) => theme.fontWeight.semibold};
      margin-right: 8px;
    }
  `,
  ButtonRow: styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  `,
  AddButton: styled.button`
    margin-top: 12px;
    width: 100%;
    padding: 12px;
    border: 1px dashed ${({ theme }) => theme.color.border};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    background: transparent;
    color: ${({ theme }) => theme.color.subText};
    font-size: ${({ theme }) => theme.fontSize.small};
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      border-color: ${({ theme }) => theme.color.primary};
      color: ${({ theme }) => theme.color.primary};
    }
  `,
};

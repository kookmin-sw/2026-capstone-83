import type { UserType } from 'entities/user/model/types/user.type';
import { RoleTab, RoleTabGroup } from './Auth.styled';

interface Props {
  selectedRole: UserType;
  onRoleChange: (role: UserType) => void;
}

const ROLE_OPTIONS: { value: UserType; label: string }[] = [
  { value: 'APPLICANT', label: '구직자' },
  { value: 'EMPLOYER', label: '고용주' },
];

const RoleTabs = ({ selectedRole, onRoleChange }: Props) => {
  return (
    <RoleTabGroup>
      {ROLE_OPTIONS.map(({ value, label }) => (
        <RoleTab
          key={value}
          type="button"
          $active={selectedRole === value}
          onClick={() => onRoleChange(value)}
        >
          {label}
        </RoleTab>
      ))}
    </RoleTabGroup>
  );
};

export default RoleTabs;

import { createPatreonIconMap } from 'utils/patronIcons';

interface UserBadgeIconsProps {
  isContributor?: boolean;
  isPvtVoidPatron?: boolean;
  isPatron?: boolean;
  isPracticeDummy?: boolean;
  metafyTiers?: string[];
  linkClassName?: string;
  iconClassName?: string;
}

const UserBadgeIcons = ({
  isContributor,
  isPvtVoidPatron,
  isPatron,
  isPracticeDummy = false,
  metafyTiers,
  linkClassName,
  iconClassName
}: UserBadgeIconsProps) => {
  return (
    <>
      {createPatreonIconMap(
        isContributor,
        isPvtVoidPatron,
        isPatron,
        isPracticeDummy,
        metafyTiers
      )
        .filter((icon) => icon.condition)
        .map((icon, index) => (
          <a
            key={`${icon.src}-${index}`}
            href={icon.href}
            target="_blank"
            rel="noopener noreferrer"
            title={icon.title}
            className={linkClassName}
          >
            <img
              src={icon.src}
              alt={icon.title}
              title={icon.title}
              className={iconClassName}
            />
          </a>
        ))}
    </>
  );
};

export default UserBadgeIcons;

import type { Level } from '../lib/plan.js';
import type { Tr } from '../lib/i18n.js';
import { levelKey } from '../lib/i18n.js';

const noop = () => {};

type Kind = 'default' | 'primary' | 'ghost' | 'link' | 'danger';

export function Button(props: { label: string; onTap: () => void; kind?: Kind; disabled?: boolean; small?: boolean }) {
  const { label, onTap, kind = 'default', disabled = false, small = false } = props;
  const cls = `btn btn--${kind}${small ? ' btn--small' : ''}${disabled ? ' btn--disabled' : ''}`;
  return (
    <view className={cls} bindtap={disabled ? noop : onTap}>
      <text className={`btn-text btn-text--${kind}${small ? ' btn-text--small' : ''}`}>{label}</text>
    </view>
  );
}

export function IconButton(props: { icon: string; onTap: () => void; disabled?: boolean; danger?: boolean }) {
  const { icon, onTap, disabled = false, danger = false } = props;
  return (
    <view className={`icon${disabled ? ' icon--disabled' : ''}`} bindtap={disabled ? noop : onTap}>
      <text className={`icon-text${danger ? ' icon-text--danger' : ''}`}>{icon}</text>
    </view>
  );
}

export function Stepper(props: { value: string; onMinus: () => void; onPlus: () => void }) {
  return (
    <view className="stepper">
      <view className="step" bindtap={props.onMinus}>
        <text className="step-text">−</text>
      </view>
      <text className="step-value">{props.value}</text>
      <view className="step" bindtap={props.onPlus}>
        <text className="step-text">+</text>
      </view>
    </view>
  );
}

export function Dot(props: { pr: Level }) {
  return <view className={`dot dot--${props.pr}`} />;
}

export function LevelPicker(props: { value: Level; onChange: (pr: Level) => void; tr: Tr }) {
  const levels: Level[] = [1, 2, 3];
  return (
    <view className="levels">
      {levels.map((pr) => (
        <view
          key={pr}
          className={`chip${props.value === pr ? ' chip--on' : ''}`}
          bindtap={() => props.onChange(pr)}
        >
          <Dot pr={pr} />
          <text className={`chip-text${props.value === pr ? ' chip-text--on' : ''}`}>{props.tr(levelKey(pr))}</text>
        </view>
      ))}
    </view>
  );
}

export function Toggle(props: { on: boolean; onTap: () => void }) {
  return (
    <view className={`toggle${props.on ? ' toggle--on' : ''}`} bindtap={props.onTap}>
      <view className={`knob${props.on ? ' knob--on' : ''}`} />
    </view>
  );
}

export function Pill(props: { label: string; tone?: 'muted' | 'active' | 'done' }) {
  const tone = props.tone ?? 'muted';
  return (
    <view className={`pill pill--${tone}`}>
      <text className={`pill-text pill-text--${tone}`}>{props.label}</text>
    </view>
  );
}

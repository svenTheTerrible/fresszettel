import type { MenuEditorProps } from '../components/MenuEditor';
import { MenuEditor } from '../components/MenuEditor';
import { AdminShell } from './AdminShell';

export function MenuEditorPage(props: MenuEditorProps) {
  return (
    <AdminShell active="speisekarte">
      <MenuEditor {...props} />
    </AdminShell>
  );
}

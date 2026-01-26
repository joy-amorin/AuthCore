import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { User } from "../auth/AuthContext";
import { getUserById, updateUser, deleteUser } from "../api/getusers";
import { getRoles, removeRoleFromUser } from "../api/getroles";
import type { Role } from "../api/getroles";
import { apiFetch } from "../api/client";
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Shield, 
  Mail, 
  User as UserIcon, 
  Users, 
  Plus, 
  X, 
  AlertCircle, 
  Loader2 
} from "lucide-react";
import { useToast } from "../contexts/ToastContexts";
import ConfirmModal from "../contexts/ConfirmModal";

const UserEdit = () => {
  const { user: authUser } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { addToast } = useToast();
  
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [userRoles, setUserRoles] = useState<{ id: string; name: string }[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roleSaving, setRoleSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authUser?.permissions.some(p => p.name === "user.change")) {
      setError("You do not have permission to edit users.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        if (!id) return;

        const data = await getUserById(id);
        setUser(data);
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");

        const formattedRoles =
          data.roles?.map((r: any) => ({
            id: r.role__id,
            name: r.role__name,
          })) || [];
        setUserRoles(formattedRoles);

        setSelectedRole(formattedRoles[0]?.id || null);

        const allRoles = await getRoles();
        setRoles(allRoles);
      } catch (err) {
        console.error(err);
        setError("Error fetching user or roles.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authUser, id]);

  const canDeleteRole = authUser?.permissions.some((p) =>
    p.name.toLowerCase().includes("user_role.delete")
  );

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      await updateUser(user.id, { first_name: firstName, last_name: lastName });
      navigate(`/panel/users/${user.id}`);
    } catch (err) {
      console.error(err);
      addToast("Error updating user.", "error");
    } finally {
      setSaving(false);
    }
  };

  // ---------- delete user --------------------
  const handleDelete = () => {
    if (!user) return;
    if (!authUser?.permissions.some(p => p.name === "user.delete")) return;

    setConfirmMessage("¿Estás seguro de que deseas eliminar este usuario?");
    setConfirmAction(() => handleDeleteConfirmed);
    setShowConfirm(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!user) return;

    try {
      await deleteUser(user.id);
      addToast("Usuario eliminado correctamente.", "success");
      navigate("/panel/users");
    } catch (err) {
      console.error(err);
      addToast("Error al eliminar usuario.", "error");
    } finally {
      setShowConfirm(false);
    }
  };
  // -------------Assign a role --------------------------

  const handleAssignRole = async () => {
    if (!user || !selectedRole) return;
    if (!authUser?.permissions.some(p => p.name === "assign.role")) return;

    try {
      setRoleSaving(true);
      await apiFetch("/api/user_role/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ user: user.id, role: selectedRole }),
      });

      addToast("Rol asignado correctamente", "success");
      const assignedRole = roles.find((r) => r.id === selectedRole);
      if (assignedRole) {
        setUserRoles((prev) => [...prev, { id: assignedRole.id, name: assignedRole.name }]);
      }
    } catch (err) {
      console.error(err);
      addToast("Error al asignar rol.", "error");
    } finally {
      setRoleSaving(false);
    }
  };

   // -------------Remove rol for user --------------------------

  const handleRemoveRole = (roleId: string) => {
  if (!user) return;
  if (!canDeleteRole) return;

 
  setConfirmMessage("¿Estás seguro de que deseas remover este rol del usuario?");

  //  Save the action that will be executed when the user confirms
   setConfirmAction(() => () => handleRemoveRoleConfirmed(roleId));

   setShowConfirm(true)  
};

// Function for role deletion
const handleRemoveRoleConfirmed = async (roleId: string) => {
  try {
    setRoleSaving(true);
    if(!user) return;
    await removeRoleFromUser(user.id, roleId);
    addToast("Rol removido correctamente.", "success");
    setUserRoles((prev) => prev.filter((r) => r.id !== roleId));
    if (selectedRole === roleId) setSelectedRole(null);
  } catch (err) {
    console.error(err);
    addToast("Error al eliminar rol.", "error");
  } finally {
    setRoleSaving(false);
  }
};


  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-green-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="font-mono text-sm tracking-wider">CARGANDO...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-2 border-red-500/50 bg-red-950/20 p-6">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-400 font-mono text-sm tracking-wide">{error}</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="border-2 border-yellow-500/50 bg-yellow-950/20 p-6">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-400" />
          <span className="text-yellow-400 font-mono text-sm tracking-wide">
            AGENTE NO ENCONTRADO
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => navigate(`/panel/users/${user.id}`)}
        className="flex items-center gap-2 text-green-400 font-mono text-sm mb-6 hover:text-green-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>VOLVER AL PERFIL</span>
      </button>

      {/* Header */}
      <div className="border-2 border-green-400/30 bg-slate-900/50 p-6 mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-green-400" />
          <div>
            <h1 className="text-2xl font-mono text-green-400 tracking-wider m-0">
              EDITAR AGENTE
            </h1>
            <p className="text-green-400/50 font-mono text-xs tracking-wide mt-1">
              ID: {user.id}
            </p>
          </div>
        </div>
      </div>

      {/* User Information Form */}
      <div className="border-2 border-green-400/30 bg-slate-900/50 p-6 mb-6">
        <h2 className="text-lg font-mono text-green-400 tracking-wider mb-4 pb-2 border-b border-green-400/20">
          INFORMACIÓN BÁSICA
        </h2>

        <div className="space-y-4">
          {/* Email (disabled) */}
          <div>
            <label className="flex items-center gap-2 text-green-400 font-mono text-xs tracking-wider mb-2">
              <Mail className="w-4 h-4" />
              EMAIL
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full bg-slate-950/50 border border-green-400/20 text-green-400/50 font-mono px-4 py-3 cursor-not-allowed"
            />
          </div>

          {/* First Name */}
          <div>
            <label className="flex items-center gap-2 text-green-400 font-mono text-xs tracking-wider mb-2">
              <UserIcon className="w-4 h-4" />
              NOMBRE
            </label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-slate-950 border border-green-400/30 text-green-400 font-mono px-4 py-3 focus:outline-none focus:border-green-400 transition-colors"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="flex items-center gap-2 text-green-400 font-mono text-xs tracking-wider mb-2">
              <UserIcon className="w-4 h-4" />
              APELLIDO
            </label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-slate-950 border border-green-400/30 text-green-400 font-mono px-4 py-3 focus:outline-none focus:border-green-400 transition-colors"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-green-400/10 border-2 border-green-400/50 hover:bg-green-400/20 text-green-400 font-mono px-6 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>GUARDANDO...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>GUARDAR CAMBIOS</span>
              </>
            )}
          </button>

          {authUser?.permissions.some(p => p.name === "user.delete") && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 border-2 border-red-500/50 bg-red-950/30 hover:bg-red-900/50 text-red-400 font-mono px-6 py-3 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>ELIMINAR AGENTE</span>
            </button>
          )}
        </div>
      </div>

      {/* Current Roles */}
      <div className="border-2 border-green-400/30 bg-slate-900/50 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-green-400/20">
          <Users className="w-5 h-5 text-green-400" />
          <h2 className="text-lg font-mono text-green-400 tracking-wider m-0">
            CLASIFICACIONES ACTUALES
          </h2>
        </div>

        {userRoles.length > 0 ? (
          <div className="space-y-2">
            {userRoles.map((role) => (
              <div
                key={role.id || role.name}
                className="flex items-center justify-between bg-slate-800/50 border border-green-400/20 p-3"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="font-mono text-green-400 text-sm tracking-wide">
                    {role.name}
                  </span>
                </div>

                {canDeleteRole && (
                  <button
                    onClick={() => handleRemoveRole(role.id)}
                    disabled={roleSaving}
                    className="flex items-center gap-2 border border-red-500/50 bg-red-950/30 hover:bg-red-900/50 text-red-400 px-3 py-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono text-xs"
                  >
                    {roleSaving ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <X className="w-3 h-3" />
                    )}
                    <span>REMOVER</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-green-400/50 font-mono text-sm">
            No hay clasificaciones asignadas
          </p>
        )}
      </div>

      {/* Assign Role */}
      {authUser?.permissions.some(p => p.name === "assign.role") && (
        <div className="border-2 border-green-400/30 bg-slate-900/50 p-6">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-green-400/20">
            <Plus className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-mono text-green-400 tracking-wider m-0">
              ASIGNAR CLASIFICACIÓN
            </h2>
          </div>

          <div className="flex gap-3">
            <select
              value={selectedRole || ""}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="flex-1 bg-slate-950 border border-green-400/30 text-green-400 font-mono px-4 py-3 focus:outline-none focus:border-green-400 transition-colors"
            >
              <option value="">-- SELECCIONAR ROL --</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleAssignRole}
              disabled={roleSaving || !selectedRole}
              className="flex items-center gap-2 bg-green-400/10 border-2 border-green-400/50 hover:bg-green-400/20 text-green-400 font-mono px-6 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {roleSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>ASIGNANDO...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>ASIGNAR</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirm && confirmAction && (
        <ConfirmModal
          open={showConfirm} 
          message={confirmMessage}
          onConfirm={() => {
            if (confirmAction) confirmAction();
            setShowConfirm(false);
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
};

export default UserEdit;

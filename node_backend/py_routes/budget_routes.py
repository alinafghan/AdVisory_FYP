from flask import Blueprint, request, jsonify
import numpy as np
import cvxpy as cp
from scipy.optimize import curve_fit

budget_bp = Blueprint('budget', __name__)
@budget_bp.route("/budget", methods=["POST"])
def allocate_budget():
    data = request.get_json()
    n_ads = int(data["n_ads"])
    B = float(data["budget"])
    conv = data["conversions"]  # list of lists

    all_zero = all(all(y == 0 for y in hist) for hist in conv)
    lengths = [len(hist) for hist in conv]

    if all_zero:
        stage = 1
        x_opt = stage1_equal_allocation(n_ads, B).tolist()
        return jsonify(stage=stage, x_opt=x_opt)

    if all(l == 1 for l in lengths):
        stage = 2
        x1 = stage1_equal_allocation(n_ads, B)
        beta = np.array([stage2_estimate_beta(x1[i], conv[i][0]) for i in range(n_ads)])
        alpha = np.zeros(n_ads)
        res = run_optimization(alpha, beta, B)
        return jsonify(stage=stage, **res)

    stage = 3
    alpha = np.zeros(n_ads)
    beta = np.zeros(n_ads)
    x1 = stage1_equal_allocation(n_ads, B)
    beta2 = np.array([stage2_estimate_beta(x1[i], conv[i][0]) for i in range(n_ads)])
    alpha2 = np.zeros(n_ads)
    res2 = run_optimization(alpha2, beta2, B)
    x2 = np.array(res2["x_opt"])

    for i in range(n_ads):
        xi = np.array([x1[i], x2[i]])
        yi_full = conv[i]
        yi = np.array(yi_full[:2]) if len(yi_full) >= 2 else np.array([yi_full[0], yi_full[0]])
        alpha[i], beta[i] = stage3_estimate_alpha_beta(xi, yi)

    res3 = run_optimization(alpha, beta, B)
    return jsonify(stage=stage, α=alpha.tolist(), β=beta.tolist(), **res3)

def stage1_equal_allocation(n_ads, B):
    return np.full(n_ads, B / n_ads)

# ---------- Stage 2 ----------
def stage2_estimate_beta(x, y):
    x = np.maximum(x, 1e-6)
    return y / np.log(x)

# ---------- Stage 3 ----------
def stage3_estimate_alpha_beta(x, y):
    x = np.maximum(x, 1e-6)
    def model(x, alpha, beta):
        return alpha + beta * np.log(x)
    popt, _ = curve_fit(
        model, x, y, p0=[0.0,1.0],
        bounds=([-np.inf,0.0],[np.inf,np.inf])
    )
    return popt[0], popt[1]

# ---------- Dual Computation ----------
def compute_dual(alpha, beta, lam, B):
    return (
        lam * B
        + np.sum(alpha)
        + np.sum(beta * (np.log(beta) - 1))
        - np.sum(beta) * np.log(lam)
    )

# ---------- Optimization ----------
def run_optimization(alpha, beta, B):
    n = len(beta)
    x = cp.Variable(n, pos=True)
    obj = cp.Maximize(cp.sum(alpha + cp.multiply(beta, cp.log(x))))
    cons = [cp.sum(x) <= B]
    prob = cp.Problem(obj, cons)
    prob.solve()
    lam = cons[0].dual_value
    return {
        "x_opt": x.value.tolist(),
        "primal": prob.value,
        "dual_var": lam,
        "dual_obj": compute_dual(alpha, beta, lam, B)
    }

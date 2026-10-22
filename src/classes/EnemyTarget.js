export default class EnemyTarget {
    constructor(hp, armor, k = 20) {
        this.hpMax = hp;         // Например, 30
        this.hpCurrent = hp;     // Текущее здоровье
        this.armor = armor;      // Например, 20
        this.k = k;              // Коэффициент защиты (по умолчанию 20)

        // Снижение урона: 20 / (20 + 20) = 0.5 (50%)
        this.damageReduction = this.armor / (this.armor + this.k);

        // Эффективное здоровье: 30 / (1 - 0.5) = 60
        this.ehpMax = this.hpMax / (1 - this.damageReduction);
    }

    // Вызывается при попадании снаряда
    takeDamage(incomingDamage) {
        // 1. Урон урезается броней
        const actualDamage = incomingDamage * (1 - this.damageReduction);

        // 2. Уменьшаем HP
        this.hpCurrent = Math.max(0, this.hpCurrent - actualDamage);

        // 3. Возвращаем текущую ширину полосы (от 0 до 4)
        return this.getBarWidth();
    }

    // Расчет ширины закрашенной части полосы (максимум = 4)
    getBarWidth() {
        const healthPercent = this.hpCurrent / this.hpMax;
        return 1.1 * healthPercent; // Возвращает значение от 0.0 до 4.0
    }
}


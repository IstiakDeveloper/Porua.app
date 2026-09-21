<?php

if (! function_exists('format_amount')) {
    /**
     * Format money: decimals only when needed (1350 vs 1350.05).
     */
    function format_amount(float|int|string|null $amount): string
    {
        $num = round((float) $amount, 2);
        $hasFraction = fmod(abs($num), 1) > 0.0001;

        return number_format($num, $hasFraction ? 2 : 0);
    }
}

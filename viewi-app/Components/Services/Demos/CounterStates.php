<?php

namespace Application\Components\Services\Demo;

class CounterState
{
    public int $count = 0;

    public function increment()
    {
        $this->count++;
    }

    public function decrement()
    {
        $this->count--;
    }
}
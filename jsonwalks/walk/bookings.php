<?php

/**
 * Description of contacts
 *
 * @author chris
 */
class RJsonwalksWalkBookings implements JsonSerializable {

    private $enabled = false;

    public function __construct($enabled) {
        $this->enabled = $enabled;
    }

    public function enabled() {
        return $this->enabled;
    }

    #[\Override]
    public function jsonSerialize(): mixed {
        return [
            'enabled' => $this->enabled
        ];
    }
}
